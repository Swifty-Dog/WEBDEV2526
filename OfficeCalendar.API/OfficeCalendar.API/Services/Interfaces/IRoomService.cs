using OfficeCalendar.API.DTOs.Room.Request;
using OfficeCalendar.API.Services.Results.Rooms;

namespace OfficeCalendar.API.Services.Interfaces;

public interface IRoomService
{
    Task<GetRoomResult> GetRoomById(long id);
    Task<CreateRoomResult> CreateRoom(CreateRoomRequest request);
    Task<GetRoomResult> GetRoomByName(string roomName);
    Task<GetRoomsListResult> GetAllRooms();
    Task<UpdateRoomResult> UpdateRoom(UpdateRoomRequest request);
    Task<DeleteRoomResult> DeleteRoom(long id);
}