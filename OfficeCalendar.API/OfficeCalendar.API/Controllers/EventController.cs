using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Services.Results.Events;


namespace OfficeCalendar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventController : BaseController
{
    private IEventService _eventService;

    public EventController(IEmployeeService employeeService, IEventService eventService)
        : base(employeeService)
    {
        _eventService = eventService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var currentUserId = GetCurrentUserId();
        if (currentUserId == null) return Unauthorized();

        var result = await _eventService.CreateEvent(currentUserId.Value, dto);

        return result switch
        {
            CreateEventResult.Success success =>
                CreatedAtAction(nameof(GetEventById), new { eventId = success.eventDto.Id }, success.eventDto),
            CreateEventResult.Error error =>
                StatusCode(500, new { message = error.Message }),
            _ => StatusCode(500, new { message = "Unexpected error occurred." })
        };
    }

    [HttpGet("{eventId:long}")]
    public async Task<IActionResult> GetEventById(long eventId)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _eventService.GetEventById(eventId, currentUserId);

        return result switch
        {
            GetEventResult.Success success => Ok(success.eventDto),
            GetEventResult.Error error => StatusCode(500, new { message = error.Message }),
            _ => StatusCode(500, new { message = "Unexpected error occurred." })
        };
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var currentUserId = GetCurrentUserId();
        var result = await _eventService.GetAllEvents(currentUserId);

        return result switch
        {
            GetEventsResult.Success success => Ok(success.eventDtoList),
            GetEventsResult.Error error => StatusCode(500, new { message = error.Message }),
            _ => StatusCode(500, new { message = "Unexpected error occurred." })
        };
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{eventId:long}")]
    public async Task<IActionResult> UpdateEvent(long eventId, [FromBody] UpdateEventDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var currentUserId = GetCurrentUserId();
        var result = await _eventService.UpdateEvent(eventId, dto, currentUserId);

        return result switch
        {
            UpdateEventResult.Success success => Ok(success.eventDto),
            UpdateEventResult.NotFound notFound => NotFound(new { message = notFound.Message }),
            UpdateEventResult.Error error => StatusCode(500, new { message = error.Message }),
            _ => StatusCode(500, new { message = "Unexpected error occurred." })
        };
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{eventId:long}")]
    public async Task<IActionResult> DeleteEvent(long eventId)
    {
        var result = await _eventService.DeleteEvent(eventId);

        return result switch
        {
            DeleteEventResult.Success => Ok(new { message = "Event deleted successfully" }),
            DeleteEventResult.NotFound notFound => NotFound(new { message = notFound.Message }),
            DeleteEventResult.Error error => StatusCode(500, new { message = error.Message }),
            _ => StatusCode(500, new { message = "Unexpected error occurred." })
        };
    }
}
