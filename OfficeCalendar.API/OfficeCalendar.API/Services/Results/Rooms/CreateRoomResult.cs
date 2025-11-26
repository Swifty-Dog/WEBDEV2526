using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Rooms;

public abstract record CreateRoomResult
{
    public sealed record Success(RoomModel Room) : CreateRoomResult;
    public sealed record DuplicateRoom(string Message, Dictionary<string, string>? Arguments = null) : CreateRoomResult;
    public sealed record Error(string Message) : CreateRoomResult;
}
