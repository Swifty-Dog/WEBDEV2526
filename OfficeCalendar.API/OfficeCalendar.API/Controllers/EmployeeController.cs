using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Employees;
using OfficeCalendar.API.DTOs.Employees.Request;

namespace OfficeCalendar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : BaseController
{
    public EmployeeController(IEmployeeService service) : base(service) { }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await EmployeeService.ValidateLogin(request);

        return result switch
        {
            LoginResult.Success success =>
                Ok(new { Employee = success.Dto, success.Dto.Token }),
            LoginResult.InvalidCredentials invalidCredentials =>
                Unauthorized(new { message = invalidCredentials.Message }),
            LoginResult.NotFound =>
                Unauthorized(new { message = "Invalid email or password." }),
            LoginResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred during login." })
        };
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await EmployeeService.RegisterEmployee(request);

        return result switch
        {
            true =>
                Ok(new { message = "Employee registered successfully." }),
            false =>
                BadRequest(new { message = "Failed to register employee." }),
            // _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred during registration." })
        };
    }
}
