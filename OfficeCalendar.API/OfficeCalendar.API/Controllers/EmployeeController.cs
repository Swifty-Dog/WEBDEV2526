using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Employees;
using OfficeCalendar.API.DTOs.Employees.Request;
using OfficeCalendar.API.DTOs.Tokens;
using OfficeCalendar.API.Services.Results.Tokens;

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
            LoginResult.Success success => Ok( new { Employee = success.Dto} ),
            LoginResult.InvalidCredentials invalidCredentials => Unauthorized(new { message = invalidCredentials.Message }),
            LoginResult.NotFound => Unauthorized(new { message = "general.API_ErrorLoginInvalid" }),
            LoginResult.Error error => StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await EmployeeService.RegisterEmployee(request);

        return result switch
        {
            RegisterResult.Success => Ok(new { message = "register.success" }),
            RegisterResult.EmailAlreadyExists => BadRequest(new { message = "general.API_ErrorEmailExists" }),
            RegisterResult.InvalidData invalidData => BadRequest(new { message = invalidData.Message }),
            RegisterResult.Error error => StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await EmployeeService.RefreshToken(request.RefreshToken);

        return result switch
        {
            TokenRefreshResult.Success success => Ok(new { Token = success.JwtToken, RefreshToken = success.RefreshToken }),
            TokenRefreshResult.InvalidToken invalidToken => BadRequest(new { message = invalidToken.Message }),
            TokenRefreshResult.Error error => StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }
}
