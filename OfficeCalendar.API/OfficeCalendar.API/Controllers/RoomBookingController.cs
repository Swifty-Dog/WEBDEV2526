using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OfficeCalendar.API.DTOs.RoomBookings.Request;
using OfficeCalendar.API.DTOs.RoomBookings.Response;
using OfficeCalendar.API.Hubs;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.RoomBookings;

namespace OfficeCalendar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RoomBookingController : BaseController
{
    private readonly IRoomBookingService _roomBookingService;
    private readonly IHubContext<GenericHub> _genericHub;

    public RoomBookingController(
        IRoomBookingService roomBookingService,
        IEmployeeService employeeService,
        IHubContext<GenericHub> genericHub) : base(employeeService)
    {
        _roomBookingService = roomBookingService;
        _genericHub = genericHub;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoomBooking([FromBody] CreateRoomBookingDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var employee = await GetCurrentUserAsync();
        if (employee is null) return Unauthorized(new { message = "Ongeldige of verlopen gebruikerssessie." });

        var result = await _roomBookingService.CreateRoomBooking(dto, employee.Id);

        if (result is CreateRoomBookingResult.Success success)
        {
            await _genericHub.BroadcastEvent("BookingChanged");
            var dtoResult = new UpcomingRoomBookingsDto
            {
                Id = success.RoomBooking.Id,
                RoomName = success.RoomBooking.Room.RoomName,
                BookingDate = success.RoomBooking.BookingDate,
                StartTime = success.RoomBooking.StartTime,
                EndTime = success.RoomBooking.EndTime,
                Purpose = success.RoomBooking.Purpose
            };

            return CreatedAtAction(nameof(CreateRoomBooking), new { id = success.RoomBooking.Id }, dtoResult);
        }

        return result switch
        {
            CreateRoomBookingResult.RoomNotAvailable =>
                Conflict(new { message = "De kamer is niet beschikbaar op de gevraagde tijd." }),
            CreateRoomBookingResult.InvalidData invalidData =>
                BadRequest(new { message = invalidData.Message }),
            CreateRoomBookingResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden bij het maken van de kamerreservering." })
        };
    }

    [HttpGet("employee/current")]
    public async Task<IActionResult> GetUpcomingRoomBookingsByEmployeeId()
    {
        var employee = await GetCurrentUserAsync();
        if (employee is null) return Unauthorized(new { message = "Ongeldige of verlopen gebruikerssessie." });

        var result = await _roomBookingService.GetUpcomingRoomBookingsByEmployeeId(employee.Id);

        return result switch
        {
            GetRoomBookingListResult.Success s => Ok(s.RoomBookings.Select(booking => new UpcomingRoomBookingsDto
            {
                Id = booking.Id,
                RoomName = booking.Room.RoomName,
                BookingDate = booking.BookingDate,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Purpose = booking.Purpose
            }).ToList()),

            GetRoomBookingListResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden bij het ophalen van de kamerreserveringen." })
        };
    }

    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetRoomBookingsByDate(DateOnly date)
    {
        var result = await _roomBookingService.GetRoomBookingsByDate(date);

        return result switch
        {
            GetRoomBookingListResult.Success s => Ok(s.RoomBookings.Select(booking => new RoomBookingDateDto
            {
                Id = booking.Id,
                RoomId = booking.RoomId,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime
            }).ToList()),

            GetRoomBookingListResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden." })
        };
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> UpdateRoomBooking(long id, [FromBody] CreateRoomBookingDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var employee = await GetCurrentUserAsync();
        if (employee is null) return Unauthorized(new { message = "Ongeldige of verlopen gebruikerssessie." });

        var result = await _roomBookingService.UpdateRoomBooking(id, dto, employee.Id);

        if (result is UpdateRoomBookingResult.Success success)
        {
            await _genericHub.BroadcastEvent("BookingChanged");

            var dtoResult = new UpcomingRoomBookingsDto
            {
                Id = success.RoomBooking.Id,
                RoomName = success.RoomBooking.Room.RoomName,
                BookingDate = success.RoomBooking.BookingDate,
                StartTime = success.RoomBooking.StartTime,
                EndTime = success.RoomBooking.EndTime,
                Purpose = success.RoomBooking.Purpose
            };

            return Ok(dtoResult);
        }

        return result switch
        {
            UpdateRoomBookingResult.NotFound =>
                NotFound(new { message = "Kamerreservering niet gevonden." }),
            UpdateRoomBookingResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden bij het bijwerken van de kamerreservering." })
        };
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteRoomBooking(long id)
    {
        var result = await _roomBookingService.DeleteRoomBooking(id);

        if (result is DeleteRoomBookingResult.Success)
        {
            await _genericHub.BroadcastEvent("BookingChanged");
            return NoContent();
        }

        return result switch
        {
            DeleteRoomBookingResult.NotFound =>
                NotFound(new { message = "Kamerreservering niet gevonden." }),
            DeleteRoomBookingResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden bij het verwijderen van de kamerreservering." })
        };
    }
}