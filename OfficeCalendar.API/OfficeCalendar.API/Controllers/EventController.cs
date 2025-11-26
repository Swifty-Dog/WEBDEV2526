using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Services.Interfaces;

namespace OfficeCalendar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventController : BaseController
{
	private readonly IAttendService _attendService;
	private readonly AppDbContext _context;

	public EventController(IEmployeeService employeeService, IAttendService attendService, AppDbContext context) : base(employeeService)
	{
		_attendService = attendService;
		_context = context;
	}

	// GET /api/Event
	// [Authorize]
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
				Attending = e.EventParticipations.Any(p => p.EmployeeId == userId)
			})
			.ToListAsync();

		return Ok(events);
	}

	// POST /api/Event/{eventId}/attend
	[Authorize]
	[HttpPost("{eventId:long}/attend")]
	public async Task<IActionResult> Attend(long eventId)
	{
		var userId = GetCurrentUserId();
		var ok = await _attendService.Attend(eventId, userId);
		if (!ok) return BadRequest(new { message = "Unable to attend the event." });
		return Ok(new { attending = true });
	}

	// DELETE /api/Event/{eventId}/attend
	[Authorize]
	[HttpDelete("{eventId:long}/attend")]
	public async Task<IActionResult> Unattend(long eventId)
	{
		var userId = GetCurrentUserId();
		var ok = await _attendService.Unattend(eventId, userId);
		if (!ok) return BadRequest(new { message = "Unable to unattend the event." });
		return Ok(new { attending = false });
	}
}