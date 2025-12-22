using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Rooms;

public abstract record GetRoomResult
{
    public sealed record Success(RoomModel Room) : GetRoomResult;
    public sealed record NotFound(string Message, Dictionary<string, string>? Arguments = null) : GetRoomResult;
    public sealed record Error(string Message) : GetRoomResult;
}
