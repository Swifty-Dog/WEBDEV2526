using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Services.Results.Events;
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
    private IEventService EventService { get; }

    public EventController(IEmployeeService employeeService, IAttendService attendService, AppDbContext context, IEventService eventService) : base(employeeService)
    {
        _attendService = attendService;
        _context = context;
        EventService = eventService;
    }

    // [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        long? currentUserId = GetCurrentUserId();

        if (currentUserId == null)
        {
            return Unauthorized();
        }

        var result = await EventService.CreateEvent(currentUserId.Value, dto);

        return result switch
        {
            CreateEventResult.Success success =>
                CreatedAtAction(nameof(GetEventById), new { eventId = success.eventModel.Id }, success.eventModel),
            CreateEventResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "An unexpected error occurred while creating the event." })
        };
    }

    [HttpGet("{eventId:long}")]
    public async Task<IActionResult> GetEventById(long eventId)
    {
        var result = await EventService.GetEventById(eventId);

        return result switch
        {
            GetEventResult.Success success =>
                Ok(success.eventDto),
            GetEventResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "An unexpected error occurred while retrieving the event." })
        };
    }

    [HttpGet]
    public async Task<IActionResult> GetAllEvents()
    {
        var result = await EventService.GetAllEvents();

        return result switch
        {
            GetEventsResult.Success success =>
                Ok(success.eventModelList),
            GetEventsResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "An unexpected error occurred while retrieving events." })
        };
    }
    // [Authorize(Roles = "admin")]
    [HttpPut("{eventId:long}")]
    public async Task<IActionResult> UpdateEvent(long eventId, [FromBody] UpdateEventDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await EventService.UpdateEvent(eventId, dto);
        return result switch
        {
            UpdateEventResult.Success success =>
                Ok(success.eventModel),
            UpdateEventResult.NotFound notFound =>
                NotFound(new { message = notFound.Message }),
            UpdateEventResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "An unexpected error occurred while updating the event." })
        };
    }
    // [Authorize(Roles = "admin")]
    [HttpDelete("{eventId:long}")]
    public async Task<IActionResult> DeleteEvent(long eventId)
    {
        var result = await EventService.DeleteEvent(eventId);

        return result switch
        {
            DeleteEventResult.Success =>
                Ok(new { message = "Event Deleted Succesfully" }),
            DeleteEventResult.NotFound notFound =>
                NotFound(new { message = notFound.Message }),
            DeleteEventResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "An unexpected error occurred while deleting the event." })
        };
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