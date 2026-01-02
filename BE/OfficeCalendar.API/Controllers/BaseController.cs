using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Employees;

namespace OfficeCalendar.API.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected readonly IEmployeeService EmployeeService;

    protected BaseController(IEmployeeService employees)
    {
        EmployeeService = employees;
    }

    protected long? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim is null || !long.TryParse(userIdClaim.Value, out long userId))
            return null;

        return userId;
    }

    protected async Task<EmployeeModel?> GetCurrentUserAsync()
    {
        var userId = GetCurrentUserId();

        if (userId == null) return null;

        var userResult = await EmployeeService.GetEmployeeById(userId.Value);

        if (userResult is not GetEmployeeResult.Success success)
            return null;

        return success.Employee;
    }
}