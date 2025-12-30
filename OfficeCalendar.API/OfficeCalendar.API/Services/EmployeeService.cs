using System.Linq.Expressions;
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
    private readonly IEmployeeRepository _employeeRepo;
    private readonly IRepository<AdminModel> _adminRepo;
    private readonly ITokenService _tokens;
    private readonly IPasswordHasher<EmployeeModel> _hasher;
    private readonly ISettingsService _settings;

    public EmployeeService(IEmployeeRepository employeeRepo,
        IRepository<AdminModel> adminRepo,
        ITokenService tokens,
        IPasswordHasher<EmployeeModel> hasher,
        ISettingsService settings)
    {
        _employeeRepo = employeeRepo;
        _adminRepo = adminRepo;
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

    public async Task<GetEmployeeListResult> GetPaginatedEmployees(int pageNumber, int pageSize, string? searchTerm)
    {
        if (pageNumber <= 0 || pageSize <= 0)
            return new GetEmployeeListResult.InvalidData("general.API_ErrorInvalidData");

        try
        {
            Expression<Func<EmployeeModel, bool>> filter = e => e.Role != "Admin" && e.Role != "Terminated";

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerTerm = searchTerm.Trim().ToLower();

                filter = e =>
                    e.Role != "Admin" &&
                    e.Role != "Terminated" &&
                    (
                        e.FirstName.ToLower().Contains(lowerTerm) ||
                        e.LastName.ToLower().Contains(lowerTerm) ||
                        (e.FirstName + " " + e.LastName).ToLower().Contains(lowerTerm) ||
                        e.Email.ToLower().Contains(lowerTerm) ||
                        e.Id.ToString().Contains(lowerTerm)
                        );
            }

            int totalCount = await _employeeRepo.CountFiltered(filter);

            var paginatedResult = await _employeeRepo.GetPaginated(pageNumber, pageSize, filter);

            return new GetEmployeeListResult.Success(paginatedResult, totalCount);
        }
        catch (Exception)
        {
            return new GetEmployeeListResult.Error("general.API_ErrorUnexpected");
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

            if (employee.Role.Equals("Terminated", StringComparison.OrdinalIgnoreCase))
                return new LoginResult.TerminatedAccount("employees.API_ErrorAccountTerminated");

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

    public async Task<TerminateEmployeeResult> TerminateEmployee(long id)
    {
        if (id <= 0) return new TerminateEmployeeResult.InvalidData("general.API_ErrorInvalidData");

        try
        {
            return await _employeeRepo.ExecuteInTransaction<TerminateEmployeeResult>(async _ =>
            {
                var employeeResult = await GetEmployeeById(id);

                if (employeeResult is not GetEmployeeResult.Success success)
                {
                    return employeeResult switch
                    {
                        GetEmployeeResult.NotFound => new TerminateEmployeeResult.NotFound(),
                        GetEmployeeResult.InvalidData invalid => new TerminateEmployeeResult.InvalidData(invalid.Message),
                        _ => new TerminateEmployeeResult.Error("general.API_ErrorUnexpected")
                    };
                }

                var employee = success.Employee;

                if (employee.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                    return new TerminateEmployeeResult.InvalidData("employees.API_ErrorCannotTerminateAdmin");

                if (employee.Role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
                {
                    var admin = await _adminRepo.GetSingle(a => a.EmployeeId == employee.Id);
                    if (admin is not null)
                    {
                        bool adminDeleted = await _adminRepo.Delete(admin);

                        if (!adminDeleted)
                            throw new Exception("Rollback: Failed to delete admin record.");
                    }
                }

                employee.Role = "Terminated";
                employee.UpdatedAt = DateTime.UtcNow;
                var updated = await _employeeRepo.Update(employee);

                if (!updated)
                    throw new Exception("Rollback: Failed to update employee record.");

                return new TerminateEmployeeResult.Success();
            });
        }
        catch (Exception)
        {
            return new TerminateEmployeeResult.Error("employees.API_ErrorTerminationFailed");
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

    public async Task<PromoteDemoteResult> PromoteDemoteEmployee(long employeeId)
    {
        if (employeeId <= 0)
            return new PromoteDemoteResult.InvalidData("employees.API_ErrorInvalidEmployeeId");

        try
        {
            var employee = await GetEmployeeById(employeeId);

            if (employee is GetEmployeeResult.Success sEmployee)
            {
                var emp = sEmployee.Employee;
                var empRole = emp.Role.Trim().ToLower();

                if (empRole == "admin")
                    return new PromoteDemoteResult.InvalidData("employees.API_ErrorCannotChangeAdminRole");

                // Toggle between manager and employee roles
                emp.Role = empRole == "manager" ? "Employee" : "Manager";
                if (emp.Role == "User") // Just in case
                    emp.Role = "Employee";
                var result = await _employeeRepo.Update(emp);

                if (result)
                    return new PromoteDemoteResult.Success(emp);
                
                return new PromoteDemoteResult.Error("employees.API_ErrorRoleUpdateFailed");
            }
            
            return new PromoteDemoteResult.NotFound();
        }
        catch (Exception)
        {
            return new PromoteDemoteResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<SearchResults> SearchEmployees(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new SearchResults.InvalidData("general.API_ErrorInvalidData");

        try
        {
            var allEmployees = await _employeeRepo.GetAll();
            allEmployees.RemoveAll(e => e.Role.Trim().ToLower() == "admin");
            var search = query.Trim().ToLower();

            var matchedEmployees = allEmployees.Where(e =>
                e.FirstName.ToLower().Contains(search) ||
                e.LastName.ToLower().Contains(search) ||
                $"{e.FirstName} {e.LastName}".ToLower().Contains(search) ||
                e.Email.ToLower().Contains(search) ||
                e.Role.ToLower().Contains(search) ||
                e.Id.ToString() == search
            ).ToList();

            if (matchedEmployees.Count == 0)
                return new SearchResults.NoResultsFound();

            return new SearchResults.Success(matchedEmployees);
        }
        catch (Exception)
        {
            return new SearchResults.Error("general.API_ErrorUnexpected");
        }
    }
}
