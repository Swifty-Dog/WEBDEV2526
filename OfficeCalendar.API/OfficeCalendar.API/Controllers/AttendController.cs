using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OfficeCalendar.API.Hubs;
using OfficeCalendar.API.Services.Interfaces;

namespace OfficeCalendar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendController : BaseController
{
    private readonly IAttendService _attendService;
    private readonly IHubContext<GenericHub> _genericHub;

    public AttendController(IEmployeeService employeeService, IAttendService attendService, IHubContext<GenericHub> hub) : base(employeeService)
    {
        _attendService = attendService;
        _genericHub = hub;
    }

    [Authorize]
    [HttpPost("events/{eventId:long}")]
    public async Task<IActionResult> Attend([FromRoute] long eventId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _attendService.Attend(eventId, userId.Value);

        if (result.Status == AttendStatus.Success)
        {
            await _genericHub.BroadcastEvent("AttendanceChanged");
            return Ok(new { attending = true });
        }

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
        if (userId == null) return Unauthorized();

        var result = await _attendService.Unattend(eventId, userId.Value);

        if (result.Status == AttendStatus.Success)
        {
            var updatedAttendees = await _attendService.GetAttendeeNames(eventId);
            await _genericHub.BroadcastEvent("AttendanceChanged", new { eventId, attendees = updatedAttendees });

            return Ok(new { attending = false });
        }

        return result.Status switch
        {
            AttendStatus.NotFound => NotFound(new { message = "Event not found or participation does not exist." }),
            AttendStatus.NoChange => NotFound(new { message = "Participation not found." }),
            AttendStatus.Error => StatusCode(500, new { message = "An error occurred while unattending the event." }),
            _ => BadRequest(new { message = "Unable to unattend the event." })
        };
    }

    [HttpGet("events/{eventId:long}/status")]
    public async Task<IActionResult> GetEventStatus([FromRoute] long eventId)
    {
        if (GetCurrentUserId() is not { } userId) return Unauthorized();

        var attendees = await _attendService.GetAttendeeNames(eventId);
        var isAttending = await _attendService.IsUserAttending(eventId, userId);

        return Ok(new { attendees, isAttending });
    }
}
