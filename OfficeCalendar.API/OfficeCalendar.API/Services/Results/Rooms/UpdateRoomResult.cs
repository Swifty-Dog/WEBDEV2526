using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Rooms;

public abstract record UpdateRoomResult
{
    public sealed record Success(RoomModel Room) : UpdateRoomResult;
    public sealed record RoomNotFound() : UpdateRoomResult;
    public sealed record InvalidData(string Message) : UpdateRoomResult;
    public sealed record Error(string Message) : UpdateRoomResult;
}