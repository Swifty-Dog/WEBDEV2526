using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.DTOs.Settings.Request;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Settings;

namespace OfficeCalendar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : BaseController
{
    private readonly ISettingsService _settings;
    private readonly ITokenService _tokens;

    public SettingsController(
        ISettingsService settings,
        ITokenService tokens,
        IEmployeeService employee) : base(employee)
    {
        _settings = settings;
        _tokens = tokens;
    }

    [HttpPost]
    public async Task<IActionResult> CreateForNewUser()
    {
        var token = HttpContext.Request.Headers["Authorization"].ToString();

        if (string.IsNullOrWhiteSpace(token) || !token.StartsWith("Bearer "))
            return Unauthorized("Missing or invalid Authorization header.");

        var jwt = token["Bearer ".Length..].Trim();
        var employeeId = _tokens.GetEmployeeIdFromToken(jwt);

        if (employeeId == null)
            return Unauthorized("Invalid or expired token.");

        var result = await _settings.CreateSettingsForNewUser(employeeId.Value);

        return result switch
        {
            CreateSettingsResult.Success s => Ok(s.Settings),
            CreateSettingsResult.Error e => BadRequest(e.Message),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [Authorize]
    [HttpGet("current")]
    public async Task<IActionResult> GetSettings()
    {
        var user = await GetCurrentUserAsync();
        var result = user is not null ? await _settings.GetSettingsByEmployeeId(user.Id) : new GetSettingsResult.UserNotFound();
        return result switch
        {
            GetSettingsResult.Success s => Ok(s.Settings),
            GetSettingsResult.NotFound => NotFound("Settings not found."),
            GetSettingsResult.UserNotFound => NotFound("User not logged in."),
            GetSettingsResult.Error e => StatusCode(StatusCodes.Status500InternalServerError, e.Message),
            _ => StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
        };
    }

    [Authorize]
    [HttpPut("current")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsDto dto)
    {
        var result = await _settings.UpdateSettings(dto);
        return ToActionResult(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("admin")]
    public async Task<IActionResult> UpdateSettingsAsAdmin([FromBody] AdminUpdateSettingsDto dto)
    {
        var result = await _settings.UpdateSettings(dto);
        return ToActionResult(result);
    }

    private ObjectResult ToActionResult(UpdateSettingsResult result)
    {
        return result switch
        {
            UpdateSettingsResult.Success s => Ok(s.Settings),
            UpdateSettingsResult.NotFound => NotFound("Settings not found."),
            UpdateSettingsResult.InvalidData i => BadRequest(i.Message),
            UpdateSettingsResult.Unauthorized => Unauthorized("You are not authorized to perform this action."),
            UpdateSettingsResult.Error e => StatusCode(StatusCodes.Status500InternalServerError, e.Message),
            _ => StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
        };
    }


}
