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
using Microsoft.OpenApi.Services;

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

            if (employee.Role == "Admin")
                return new GetEmployeeResult.InvalidData("Access to admin employee data is restricted.");
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

    public async Task<PromoteDemoteResult> PromoteDemoteEmployee(long employeeId)
    {
        if (employeeId <= 0)
            return new PromoteDemoteResult.InvalidData("The employee ID must be greater than zero.");

        try
        {
            var employee = await GetEmployeeById(employeeId);

            if (employee is GetEmployeeResult.Success sEmployee)
            {
                var emp = sEmployee.Employee;
                var empRole = emp.Role.Trim().ToLower();

                if (empRole == "admin")
                    return new PromoteDemoteResult.InvalidData("Cannot change role of an admin employee.");

                // Toggle between manager and employee roles
                emp.Role = empRole == "manager" ? "Employee" : "Manager";
                if (emp.Role == "User") // Just in case
                    emp.Role = "Employee";
                var result = await _employeeRepo.Update(emp);

                if (result)
                    return new PromoteDemoteResult.Success(emp);
                else
                    return new PromoteDemoteResult.Error("Failed to update employee role.");
            }
            
            return new PromoteDemoteResult.NotFound();
        }
        catch
        {
            return new PromoteDemoteResult.Error("An error occurred while updating the employee role.");
        }
    }

    public async Task<SearchResults> SearchEmployees<T>(T search)
    {
        if (search is null || (search is string str && string.IsNullOrWhiteSpace(str)))
            return new SearchResults.InvalidData("Search query cannot be null or empty.");

        try
        {
            var allEmployees = await _employeeRepo.GetAll();
            allEmployees.RemoveAll(e => e.Role.Trim().ToLower() == "admin");
            var query = search.ToString()!.Trim().ToLower();

            var matchedEmployees = allEmployees.Where(e =>
                e.FirstName.ToLower().Contains(query) ||
                e.LastName.ToLower().Contains(query) ||
                e.Email.ToLower().Contains(query) ||
                e.Role.ToLower().Contains(query)
            ).ToList();

            if (matchedEmployees.Count == 0)
                return new SearchResults.NoResultsFound();

            return new SearchResults.Success(matchedEmployees);
        }
        catch (Exception ex)
        {
            return new SearchResults.Error($"An error occurred while searching for employees: {ex.Message}");
        }
    }
}