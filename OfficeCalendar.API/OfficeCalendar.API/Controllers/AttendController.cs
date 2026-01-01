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
        if (userId == null)
            return Unauthorized(new { message = "general.Unauthorized" });

        await _genericHub.BroadcastEvent("AttendanceChanged");

        var result = await _attendService.Attend(eventId, userId.Value);
        return result.Status switch
        {
            AttendStatus.Success => Ok(new { attending = true }),
            AttendStatus.NotFound => NotFound(new { message = "attendance.EventNotFound" }),
            AttendStatus.Error => StatusCode(500, new { message = "general.API_ErrorUnexpected" }),
            _ => BadRequest(new { message = "general.BadRequest" })
        };
    }

    [Authorize]
    [HttpDelete("events/{eventId:long}")]
    public async Task<IActionResult> Unattend([FromRoute] long eventId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized(new { message = "general.Unauthorized" });

        await _genericHub.BroadcastEvent("AttendanceChanged");

        var result = await _attendService.Unattend(eventId, userId.Value);
        return result.Status switch
        {
            AttendStatus.Success => Ok(new { attending = false }),
            AttendStatus.NotFound => NotFound(new { message = "attendance.EventNotFound" }),
            AttendStatus.NoChange => NotFound(new { message = "attendance.ParticipationNotFound" }),
            AttendStatus.Error => StatusCode(500, new { message = "general.API_ErrorUnexpected" }),
            _ => BadRequest(new { message = "general.BadRequest" })
        };
    }

}
