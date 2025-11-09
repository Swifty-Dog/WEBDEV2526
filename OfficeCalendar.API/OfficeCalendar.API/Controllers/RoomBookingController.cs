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
    private readonly IHubContext<RoomBookingHub> _hubContext;

    public RoomBookingController(
        IRoomBookingService roomBookingService,
        IEmployeeService employeeService,
        IHubContext<RoomBookingHub> hubContext) : base(employeeService)
    {
        _roomBookingService = roomBookingService;
        _hubContext = hubContext;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoomBooking([FromBody] CreateRoomBookingDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _roomBookingService.CreateRoomBooking(dto);

        if (result is CreateRoomBookingResult.Success success)
        {
            await _hubContext.Clients.All.SendAsync("BookingChanged");
            return CreatedAtAction(nameof(CreateRoomBooking), new { id = success.RoomBooking.Id }, success.RoomBooking);
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

    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetUpcomingRoomBookingsByEmployeeId(long employeeId)
    {
        var result = await _roomBookingService.GetUpcomingRoomBookingsByEmployeeId(employeeId);

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
}