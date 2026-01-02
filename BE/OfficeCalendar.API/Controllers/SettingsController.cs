using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.DTOs.Settings.Request;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Settings;

namespace OfficeCalendar.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SettingsController : BaseController
{
    private readonly ISettingsService _settings;

    public SettingsController(ISettingsService settings, IEmployeeService employee) : base(employee)
    {
        _settings = settings;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateForNewUser()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null || !long.TryParse(claim.Value, out var employeeId))
            return Unauthorized(new { message = "general.API_ErrorInvalidSession" });

        var result = await _settings.CreateSettingsForNewUser(employeeId);

        return result switch
        {
            CreateSettingsResult.Success s => Ok(s.Settings),
            CreateSettingsResult.Error e => BadRequest(new { message = e.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetSettings()
    {
        var user = await GetCurrentUserAsync();

        if (user is null)
            return Unauthorized(new { message = "general.API_ErrorInvalidSession" });


        var result = await _settings.GetSettingsByEmployeeId(user.Id);

        return result switch
        {
            GetSettingsResult.Success s => Ok(s.Settings),
            GetSettingsResult.NotFound notFound => NotFound(new { message = notFound.Message }),
            GetSettingsResult.UserNotFound userNotFound => NotFound(new { message = userNotFound.Message }),
            GetSettingsResult.Error e => StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }

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
            UpdateSettingsResult.NotFound notFound => NotFound(new { message = notFound.Message }),
            UpdateSettingsResult.InvalidData invalidData => BadRequest(new { message = invalidData.Message, arguments = invalidData.Arguments }),
            UpdateSettingsResult.Unauthorized unauthorized => Unauthorized(new { message = unauthorized.Message }),
            UpdateSettingsResult.Error e => StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }
}
