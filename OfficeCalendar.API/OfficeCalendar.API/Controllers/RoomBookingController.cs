using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.DTOs.RoomBookings;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.RoomBookings;

namespace OfficeCalendar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RoomBookingController : BaseController
{
    private readonly IRoomBookingService _roomBookingService;

    public RoomBookingController(IRoomBookingService roomBookingService, IEmployeeService employeeService) : base(employeeService)
    {
        _roomBookingService = roomBookingService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoomBooking([FromBody] CreateRoomBookingRequest request)
    {
        Console.WriteLine(JsonSerializer.Serialize(request));
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _roomBookingService.CreateRoomBooking(request);

        return result switch
        {
            CreateRoomBookingResult.Success success =>
                CreatedAtAction(nameof(CreateRoomBooking), new { id = success.RoomBooking.Id }, success.RoomBooking),
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
}