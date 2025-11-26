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
        var ok = await _attendService.Attend(eventId, userId);
        if (!ok) return BadRequest(new { message = "Unable to attend the event." });
        return Ok(new { attending = true });
    }

    [Authorize]
    [HttpDelete("events/{eventId:long}")]
    public async Task<IActionResult> Unattend([FromRoute] long eventId)
    {
        var userId = GetCurrentUserId();
        var ok = await _attendService.Unattend(eventId, userId);
        if (!ok) return BadRequest(new { message = "Unable to unattend the event." });
        return Ok(new { attending = false });
    }
}
