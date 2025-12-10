using Microsoft.AspNetCore.Identity.Data;
using OfficeCalendar.API.Services.Results.Employees;
using OfficeCalendar.API.DTOs.Employees.Request;
using OfficeCalendar.API.Services.Results.Tokens;

namespace OfficeCalendar.API.Services.Interfaces;

public interface IEmployeeService
{
    Task<GetEmployeeResult> GetEmployeeById(long id);
    Task<GetEmployeeResult> GetEmployeeByEmail(string email);
    Task<GetEmployeeListResult> GetPaginatedEmployees(int pageNumber, int pageSize, string? searchTerm);
    Task<LoginResult> ValidateLogin(LoginRequest dto);
    Task<RegisterResult> RegisterEmployee(RegisterDto employee);
    Task<TerminateEmployeeResult> TerminateEmployee(long id);
    Task<TokenRefreshResult> RefreshToken(string refreshToken);
}
