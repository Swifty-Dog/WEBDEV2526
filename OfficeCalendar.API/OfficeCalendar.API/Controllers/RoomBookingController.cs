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
        if (employee is null) return Unauthorized(new { message = "general.API_ErrorInvalidSession" });

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
            CreateRoomBookingResult.RoomNotAvailable => Conflict(new { message = "roomBookings.API_ErrorConflict" }),
            CreateRoomBookingResult.InvalidData invalidData => BadRequest(new { message = invalidData.Message, arguments = invalidData.Arguments }),
            CreateRoomBookingResult.Error error => StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }

    [HttpGet("employee/current")]
    public async Task<IActionResult> GetUpcomingRoomBookingsByEmployeeId()
    {
        var employee = await GetCurrentUserAsync();
        if (employee is null) return Unauthorized(new { message = "general.API_ErrorInvalidSession" });

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

            GetRoomBookingListResult.Error error => StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
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

            GetRoomBookingListResult.Error error => StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> UpdateRoomBooking(long id, [FromBody] CreateRoomBookingDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var employee = await GetCurrentUserAsync();
        if (employee is null) return Unauthorized(new { message = "general.API_ErrorInvalidSession" });

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
            UpdateRoomBookingResult.NotFound notFound => NotFound(new { message = notFound.Message, arguments = notFound.Arguments }),
            UpdateRoomBookingResult.Error error => StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message, arguments = error.Arguments }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
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
            DeleteRoomBookingResult.NotFound notFound => NotFound(new { message = notFound.Message, arguments = notFound.Arguments }),
            DeleteRoomBookingResult.Error error => StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "general.API_ErrorUnexpected" })
        };
    }
}