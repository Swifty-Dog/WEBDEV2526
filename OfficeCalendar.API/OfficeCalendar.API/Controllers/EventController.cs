using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Services.Interfaces;

namespace OfficeCalendar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventController : BaseController
{
	private readonly IAttendService _attendService;
	private readonly AppDbContext _context;

	public EventController(IEmployeeService employeeService, IAttendService attendService, AppDbContext context) : base(employeeService)
	{
		_attendService = attendService;
		_context = context;
	}

	[HttpGet]
	public async Task<IActionResult> GetAll()
	{
		var userId = GetCurrentUserId();
		var events = await _context.Events
			.Include(e => e.EventParticipations)
				.ThenInclude(p => p.Employee)
			.Include(e => e.Room)
			.OrderBy(e => e.EventDate)
			.Select(e => new EventDto
			{
				Id = e.Id,
				Title = e.Title,
				Description = e.Description,
				EventDate = e.EventDate,
				RoomName = e.Room != null ? e.Room.RoomName : null,
				Location = e.Room != null ? e.Room.Location : null,
				Attendees = e.EventParticipations.Select(p => p.Employee.FullName).ToList(),
				Attending = userId != null && e.EventParticipations.Any(p => p.EmployeeId == userId.Value)
			})
			.ToListAsync();

		return Ok(events);
	}

	[HttpPost("{eventId:long}/attend")]
	public async Task<IActionResult> Attend(long eventId)
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

	[HttpDelete("{eventId:long}/attend")]
	public async Task<IActionResult> Unattend(long eventId)
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