using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using OfficeCalendar.API.DTOs.Employees.Response;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Employees;
using OfficeCalendar.API.Services.Results.Tokens;
using OfficeCalendar.API.DTOs.Employees.Request;
using Microsoft.AspNetCore.Http.HttpResults;

namespace OfficeCalendar.API.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepo;
    private readonly ITokenService _tokens;
    private readonly IPasswordHasher<EmployeeModel> _hasher;

    public EmployeeService(IEmployeeRepository employeeRepo, ITokenService tokens, IPasswordHasher<EmployeeModel> hasher)
    {
        _employeeRepo = employeeRepo;
        _tokens = tokens;
        _hasher = hasher;
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
            var employee = await _employeeRepo.GetByEmail(email);
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
        if (employee is null)
            return new RegisterResult.InvalidData("Employee data is required.");

        employee.Password = _hasher.HashPassword(null, employee.Password);

        foreach (var existingEmployee in await _employeeRepo.GetAll())
        {
            if (employee.Email == existingEmployee.Email)
                return new RegisterResult.EmailAlreadyExists();
        }
        
        try
        {
            var newEmployee = new EmployeeModel
            {
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                PasswordHash = employee.Password
            };

            var result = await _employeeRepo.Create(newEmployee);

            return result ? new RegisterResult.Success(newEmployee) : new RegisterResult.Error("Failed to register employee.");
        }
        catch
        {
            return new RegisterResult.Error("An error occurred while registering the employee.");
        }
    }
}