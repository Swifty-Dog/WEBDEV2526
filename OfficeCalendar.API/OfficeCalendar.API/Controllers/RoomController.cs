using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.DTOs.Room.Request;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Rooms;

namespace OfficeCalendar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RoomController : BaseController
{
    private readonly IRoomService _roomService;

    public RoomController(IRoomService roomService, IEmployeeService employeeService) : base(employeeService)
    {
        _roomService = roomService;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetRoomById(int id)
    {
        var result = await _roomService.GetRoomById(id);

        return result switch
        {
            GetRoomResult.Success success =>
                Ok(success.Room),
            GetRoomResult.NotFound notFound =>
                NotFound(new { message = notFound.Message }),
            GetRoomResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden bij het ophalen van de kamer." })
        };
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _roomService.CreateRoom(request);
        return result switch
        {
            CreateRoomResult.Success success =>
                CreatedAtAction(nameof(GetRoomById), new { id = success.Room.Id }, success.Room),
            CreateRoomResult.DuplicateRoom duplicateRoom =>
                Conflict(new { message = duplicateRoom.Message }),
            CreateRoomResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden bij het maken van de kamer." })
        };
    }

    [HttpGet]
    public async Task<IActionResult> GetAllRooms()
    {
        var rooms = await _roomService.GetAllRooms();
        return rooms switch
        {
            GetRoomsListResult.Success success =>
                Ok(success.Rooms),
            GetRoomsListResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new { message = "Een onverwachte fout is opgetreden bij het ophalen van de kamers." })
        };
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateRoom(long id, [FromBody] UpdateRoomRequest request)
    {
        if (id != request.Id)
            return BadRequest(new { message = "URL ID en body ID komen niet overeen." });

        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _roomService.UpdateRoom(request);
        return result switch
        {
            UpdateRoomResult.Success success =>
                Ok(success.Room),
            UpdateRoomResult.RoomNotFound _ =>
                NotFound(new { message = "Kamer niet gevonden." }),
            UpdateRoomResult.InvalidData invalidData =>
                BadRequest(new { message = invalidData.Message }),
            UpdateRoomResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden bij het bijwerken van de kamer." })
        };
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var result = await _roomService.DeleteRoom(id);

        return result switch
        {
            DeleteRoomResult.Success _ =>
                NoContent(),
            DeleteRoomResult.RoomNotFound _ =>
                NotFound(new { message = "Kamer niet gevonden." }),
            DeleteRoomResult.Error error =>
                StatusCode(StatusCodes.Status500InternalServerError, new { message = error.Message }),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Een onverwachte fout is opgetreden bij het verwijderen van de kamer." })
        };
    }
}