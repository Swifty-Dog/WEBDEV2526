using System.Linq.Expressions;
using Microsoft.AspNetCore.Identity;
using Moq;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Employees;
using OfficeCalendar.API.Services.Results.Tokens;

namespace OfficeCalendar.API.Tests;

public class EmployeeServiceTests
{
    #region Setup
    private readonly Mock<IEmployeeRepository> _employeeRepoMock = new();
    private readonly Mock<IRepository<AdminModel>> _adminRepoMock = new();
    private readonly Mock<ITokenService> _tokenServiceMock = new();
    private readonly Mock<IPasswordHasher<EmployeeModel>> _hasherMock = new();
    private readonly Mock<ISettingsService> _settingsServiceMock = new();
    private readonly EmployeeService _employeeService;


    public EmployeeServiceTests()
    {
        _employeeService = new EmployeeService(
            _employeeRepoMock.Object,
            _adminRepoMock.Object,
            _tokenServiceMock.Object,
            _hasherMock.Object,
            _settingsServiceMock.Object
        );
    }

    #endregion

    #region GetById

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetEmployeeById_InvalidId_ReturnsInvalidData(long id)
    {
        var result = await _employeeService.GetEmployeeById(id);

        Assert.IsType<GetEmployeeResult.InvalidData>(result);
    }

    [Fact]
    public async Task GetEmployeeById_EmployeeNotFound_ReturnsNotFound()
    {
        _employeeRepoMock.Setup(repo => repo.GetById(It.IsAny<long>())).ReturnsAsync((EmployeeModel?)null);

        var result = await _employeeService.GetEmployeeById(1);

        Assert.IsType<GetEmployeeResult.NotFound>(result);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(123)]
    public async Task GetEmployeeById_EmployeeFound_ReturnsSuccess(long id)
    {
        var employee = new EmployeeModel { Id = id, FirstName = "Alice" };
        _employeeRepoMock.Setup(r => r.GetById(id)).ReturnsAsync(employee);

        var result = await _employeeService.GetEmployeeById(id);

        var success = Assert.IsType<GetEmployeeResult.Success>(result);
        Assert.Equal(employee, success.Employee);
    }

    #endregion

    #region ValidateLogin

    [Theory]
    [InlineData(null, null)]
    [InlineData("", "")]
    [InlineData("test@example.com", "")]
    [InlineData("", "password")]
    public async Task ValidateLogin_InvalidCredentials_ReturnsInvalidCredentials(string email, string password)
    {
        var result = await _employeeService.ValidateLogin(new() { Email = email, Password = password });
        Assert.IsType<LoginResult.InvalidCredentials>(result);
    }

    [Fact]
    public async Task ValidateLogin_EmployeeNotFound_ReturnsNotFound()
    {
        _employeeRepoMock.Setup(repo => repo.GetSingle(It.IsAny<Expression<Func<EmployeeModel, bool>>>())).
            ReturnsAsync((EmployeeModel?)null);

        var result = await _employeeService.ValidateLogin(new() { Email = "john@doe.com", Password = "password" });

        Assert.IsType<LoginResult.NotFound>(result);
    }

    [Theory]
    [InlineData("john@doe.com", "correctPassword")]
    public async Task ValidateLogin_ValidCredentials_ReturnsSuccess(string email, string password)
    {
        var employee = new EmployeeModel { Id = 1, Email = email, FirstName = "John" };
        _employeeRepoMock.Setup(repo => repo.GetSingle(It.IsAny<Expression<Func<EmployeeModel, bool>>>()))
            .ReturnsAsync(employee);
        _hasherMock.Setup(hasher => hasher.VerifyHashedPassword(employee, It.IsAny<string>(), password))
            .Returns(PasswordVerificationResult.Success);
        _tokenServiceMock.Setup(tokenService => tokenService.GenerateToken(employee)).Returns(new CreateJwtResult.Success("valid_token"));

        var result = await _employeeService.ValidateLogin(new() { Email = email, Password = password });

        var success = Assert.IsType<LoginResult.Success>(result);
        Assert.Equal(employee.Email, success.Dto.Email);
        Assert.Equal("valid_token", success.Dto.Token);
    }

    [Theory]
    [InlineData("john123", "7213y78gyudhbfkdasfhjhbaksdf3i4uy378b")]
    public async Task ValidateLogin_HashVerificationFails_ReturnsInvalidCredentials(string email, string password)
    {
        var employee = new EmployeeModel { Id = 1, Email = email, FirstName = "John" };

        _employeeRepoMock.Setup(repo => repo.GetSingle(It.IsAny<Expression<Func<EmployeeModel, bool>>>()))
            .ReturnsAsync(employee);
        _hasherMock.Setup(hasher => hasher.VerifyHashedPassword(employee, It.IsAny<string>(), password))
            .Returns(PasswordVerificationResult.Failed);

        var result = await _employeeService.ValidateLogin(new() { Email = email, Password = password });

        Assert.IsType<LoginResult.InvalidCredentials>(result);
    }

    #endregion
}