using Microsoft.AspNetCore.Identity.Data;
using OfficeCalendar.API.Services.Results.Employees;
using OfficeCalendar.API.DTOs.Employees.Request;

namespace OfficeCalendar.API.Services.Interfaces;

public interface IEmployeeService
{
    Task<GetEmployeeResult> GetEmployeeById(long id);
    Task<LoginResult> ValidateLogin(LoginRequest dto);
    Task<bool> RegisterEmployee(RegisterDto employee);
}
