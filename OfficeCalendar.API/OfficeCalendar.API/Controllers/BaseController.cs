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

    protected long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim is null || !long.TryParse(userIdClaim.Value, out long userId))
            throw new InvalidOperationException("User ID claim is missing or invalid in the token.");

        return userId;
    }

    protected async Task<EmployeeModel?> GetCurrentUserAsync()
    {
        var userId = GetCurrentUserId();
        var userResult = await EmployeeService.GetEmployeeById(userId);

        if (userResult is not GetEmployeeResult.Success success)
            throw new UnauthorizedAccessException("Authenticated user record not found.");

        return success.Employee;
    }
}