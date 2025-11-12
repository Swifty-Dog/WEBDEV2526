using OfficeCalendar.API.DTOs.Rooms.Request;
using OfficeCalendar.API.Services.Results.Rooms;

namespace OfficeCalendar.API.Services.Interfaces;

public interface IRoomService
{
    Task<GetRoomResult> GetRoomById(long id);
    Task<CreateRoomResult> CreateRoom(CreateRoomDto dto);
    Task<GetRoomResult> GetRoomByName(string roomName);
    Task<GetRoomsListResult> GetAllRooms();
    Task<UpdateRoomResult> UpdateRoom(UpdateRoomDto dto);
    Task<DeleteRoomResult> DeleteRoom(long id);
}