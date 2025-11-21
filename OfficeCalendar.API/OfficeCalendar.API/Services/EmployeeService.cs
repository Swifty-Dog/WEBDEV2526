using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using OfficeCalendar.API.DTOs.Employees.Response;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Employees;
using OfficeCalendar.API.Services.Results.Tokens;
using OfficeCalendar.API.DTOs.Employees.Request;
using OfficeCalendar.API.Models.Repositories;
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
            return new GetEmployeeResult.InvalidData("The id cannot be 0 or negative.");

        try
        {
            var employee = await _employeeRepo.GetById(id);
            if (employee is null)
                return new GetEmployeeResult.NotFound();
            return new GetEmployeeResult.Success(employee);
        }
        catch (Exception ex)
        {
            return new GetEmployeeResult.Error($"An error occurred while retrieving the employee: {ex.Message}");
        }
    }

    public async Task<GetEmployeeResult> GetEmployeeByEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return new GetEmployeeResult.InvalidData("Email is required.");

        try
        {
            var employee = await _employeeRepo.GetSingle(e => e.Email == email);
            if (employee is null)
                return new GetEmployeeResult.NotFound();
            return new GetEmployeeResult.Success(employee);
        }
        catch (Exception ex)
        {
            return new GetEmployeeResult.Error($"An error occurred while retrieving the employee: {ex.Message}");
        }
    }

    public async Task<LoginResult> ValidateLogin(LoginRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            if (string.IsNullOrWhiteSpace(dto.Password))
                return new LoginResult.InvalidCredentials("Email and password are required.");
            return new LoginResult.InvalidCredentials("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Password))
            return new LoginResult.InvalidCredentials("Password is required.");

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
                return new LoginResult.InvalidCredentials("Invalid email or password.");

            var tokenResult = _tokens.GenerateToken(employee);
            if (tokenResult is CreateJwtResult.ConfigError error)
                return new LoginResult.Error($"Token generation failed: {error.Message}");

            var response = new AuthDto
            {
                EmployeeId = employee.Id,
                Name = employee.FullName,
                Email = employee.Email,
                Role = employee.Role,
                Token = (tokenResult as CreateJwtResult.Success)!.Token
            };

            return new LoginResult.Success(response);
        }
        catch (Exception ex)
        {
            return new LoginResult.Error($"An error occurred while validating login: {ex.Message}");
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
                    throw new InvalidOperationException("Email already exists.");

                var createdEmployee = new EmployeeModel
                {
                    FirstName = employee.FirstName,
                    LastName = employee.LastName,
                    Email = employee.Email,
                    PasswordHash = hashedPassword
                };

                var created = await _employeeRepo.Create(createdEmployee);
                if (!created) throw new Exception("Failed to create employee.");

                var settingsResult = await _settings.CreateSettingsForNewUser(createdEmployee.Id);
                if (settingsResult is CreateSettingsResult.Error error)
                    throw new Exception($"Failed to create settings: {error.Message}");

                return createdEmployee;
            });

            return new RegisterResult.Success(newEmployee);
        }
        catch (InvalidOperationException)
        {
            return new RegisterResult.EmailAlreadyExists();
        }

        catch (Exception ex)
        {
            return new RegisterResult.Error($"An error occurred while registering the employee: {ex.Message}");
        }
    }
}
