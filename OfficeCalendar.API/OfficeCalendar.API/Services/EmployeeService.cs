using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using OfficeCalendar.API.DTOs.Employees.Response;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Employees;
using OfficeCalendar.API.Services.Results.Tokens;
using OfficeCalendar.API.DTOs.Employees.Request;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Results.Settings;

namespace OfficeCalendar.API.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IRepository<EmployeeModel> _employeeRepo;
    private readonly ITokenService _tokens;
    private readonly IPasswordHasher<EmployeeModel> _hasher;
    private readonly ISettingsService _settings;

    public EmployeeService(IRepository<EmployeeModel> employeeRepo,
        ITokenService tokens,
        IPasswordHasher<EmployeeModel> hasher,
        ISettingsService settings)
    {
        _employeeRepo = employeeRepo;
        _tokens = tokens;
        _hasher = hasher;
        _settings = settings;
    }

    public async Task<GetEmployeeResult> GetEmployeeById(long id)
    {
        if (id <= 0)
            return new GetEmployeeResult.InvalidData("general.API_ErrorInvalidData");

        try
        {
            var employee = await _employeeRepo.GetById(id);
            if (employee is null)
                return new GetEmployeeResult.NotFound();
            return new GetEmployeeResult.Success(employee);
        }
        catch (Exception)
        {
            return new GetEmployeeResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<GetEmployeeResult> GetEmployeeByEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return new GetEmployeeResult.InvalidData("employees.API_ErrorEmailRequired");

        try
        {
            var employee = await _employeeRepo.GetSingle(e => e.Email == email);
            if (employee is null)
                return new GetEmployeeResult.NotFound();
            return new GetEmployeeResult.Success(employee);
        }
        catch (Exception)
        {
            return new GetEmployeeResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<LoginResult> ValidateLogin(LoginRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            if (string.IsNullOrWhiteSpace(dto.Password))
                return new LoginResult.InvalidCredentials("employees.API_ErrorEmailPasswordRequired");
            return new LoginResult.InvalidCredentials("employees.API_ErrorEmailRequired");
        }

        if (string.IsNullOrWhiteSpace(dto.Password))
            return new LoginResult.InvalidCredentials("employees.API_ErrorPasswordRequired");

        try
        {
            EmployeeModel? employee = null;
            var emailResult = await GetEmployeeByEmail(dto.Email);

            if (emailResult is GetEmployeeResult.Success sEmail)
                employee = sEmail.Employee;

            if (employee is null)
                return new LoginResult.NotFound();

            var verification = _hasher.VerifyHashedPassword(employee, employee.PasswordHash, dto.Password);
            if (verification == PasswordVerificationResult.Failed)
                return new LoginResult.InvalidCredentials("employees.API_ErrorLoginInvalid");

            var refreshToken = _tokens.GenerateRefreshToken();
            employee.RefreshToken = refreshToken;
            employee.RefreshTokenExpiryTime = _tokens.GetRefreshTokenExpiryTime();
            await _employeeRepo.Update(employee);

            var tokenResult = _tokens.GenerateToken(employee);
            if (tokenResult is CreateJwtResult.ConfigError)
                return new LoginResult.Error("employees.API_ErrorTokenConfig");

            var response = new AuthDto
            {
                EmployeeId = employee.Id,
                Name = employee.FullName,
                Email = employee.Email,
                Role = employee.Role,
                Token = (tokenResult as CreateJwtResult.Success)!.Token,
                RefreshToken = refreshToken
            };

            return new LoginResult.Success(response);
        }
        catch (Exception)
        {
            return new LoginResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<RegisterResult> RegisterEmployee(RegisterDto employee)
    {
        var hashedPassword = _hasher.HashPassword(null, employee.Password);

        try
        {
            var newEmployee = await _employeeRepo.ExecuteInTransaction(async _ =>
            {
                var existing = await GetEmployeeByEmail(employee.Email);
                if (existing is GetEmployeeResult.Success)
                    throw new InvalidOperationException("employees.API_ErrorEmailExists");

                var createdEmployee = new EmployeeModel
                {
                    FirstName = employee.FirstName,
                    LastName = employee.LastName,
                    Email = employee.Email,
                    PasswordHash = hashedPassword
                };

                var created = await _employeeRepo.Create(createdEmployee);
                if (!created) throw new Exception("employees.API_ErrorCreateFailed");

                var settingsResult = await _settings.CreateSettingsForNewUser(createdEmployee.Id);
                if (settingsResult is CreateSettingsResult.Error error)
                    throw new Exception(error.Message);

                return createdEmployee;
            });

            return new RegisterResult.Success(newEmployee);
        }
        catch (InvalidOperationException)
        {
            return new RegisterResult.EmailAlreadyExists();
        }

        catch (Exception)
        {
            return new RegisterResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<TokenRefreshResult> RefreshToken(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return new TokenRefreshResult.InvalidToken("tokens.API_ErrorRefreshTokenRequired");

        try
        {
            var employee = await _employeeRepo.GetSingle(e => e.RefreshToken == refreshToken);

            if (employee is null)
                return new TokenRefreshResult.InvalidToken("tokens.API_ErrorInvalidRefreshToken");

            if (employee.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                employee.RefreshToken = null;
                employee.RefreshTokenExpiryTime = null;
                await _employeeRepo.Update(employee);
                return new TokenRefreshResult.InvalidToken("tokens.API_ErrorRefreshTokenExpired");
            }

            var newRefreshToken = _tokens.GenerateRefreshToken();

            var tokenResult = _tokens.GenerateToken(employee);
            if (tokenResult is not CreateJwtResult.Success success)
                return new TokenRefreshResult.Error("tokens.API_ErrorTokenGenerationFailed");

            employee.RefreshToken = newRefreshToken;
            employee.RefreshTokenExpiryTime = _tokens.GetRefreshTokenExpiryTime();
            await _employeeRepo.Update(employee);

            return new TokenRefreshResult.Success(success.Token, newRefreshToken);
        }
        catch (Exception)
        {
            return new TokenRefreshResult.Error("general.API_ErrorUnexpected");
        }
    }
}
