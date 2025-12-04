using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Services.Results.Events;
namespace OfficeCalendar.API.Controllers;

[ApiController]
[Route("api/[controller]")]

public class EventController : BaseController
{
    private IEventService EventService { get; }
    public EventController(IEventService eventService, IEmployeeService employeeService) : base(employeeService)
    {
        EventService = eventService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await EventService.CreateEvent(dto);

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
                Ok(success.eventModel),
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

    [HttpPut("{eventId:long}")]
    public async Task<IActionResult> UpdateEvent([FromBody] UpdateEventDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await EventService.UpdateEvent(dto);

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













}



