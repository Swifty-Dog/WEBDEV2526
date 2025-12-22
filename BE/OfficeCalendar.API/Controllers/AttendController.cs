using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.Services.Interfaces;

namespace OfficeCalendar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendController : BaseController
{
    private readonly IAttendService _attendService;

    public AttendController(IEmployeeService employeeService, IAttendService attendService) : base(employeeService)
    {
        _attendService = attendService;
    }

    [Authorize]
    [HttpPost("events/{eventId:long}")]
    public async Task<IActionResult> Attend([FromRoute] long eventId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { message = "User not authenticated." });
        var result = await _attendService.Attend(eventId, userId.Value);
        return result.Status switch
        {
            AttendStatus.Success => Ok(new { attending = true }),
            AttendStatus.NotFound => NotFound(new { message = "Event not found." }),
            AttendStatus.Error => StatusCode(500, new { message = "An error occurred while attending the event." }),
            _ => BadRequest(new { message = "Unable to attend the event." })
        };
    }

    [Authorize]
    [HttpDelete("events/{eventId:long}")]
    public async Task<IActionResult> Unattend([FromRoute] long eventId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { message = "User not authenticated." });
        var result = await _attendService.Unattend(eventId, userId.Value);
        return result.Status switch
        {
            AttendStatus.Success => Ok(new { attending = false }),
            AttendStatus.NotFound => NotFound(new { message = "Event not found or participation does not exist." }),
            AttendStatus.NoChange => NotFound(new { message = "Participation not found." }),
            AttendStatus.Error => StatusCode(500, new { message = "An error occurred while unattending the event." }),
            _ => BadRequest(new { message = "Unable to unattend the event." })
        };
    }
}
