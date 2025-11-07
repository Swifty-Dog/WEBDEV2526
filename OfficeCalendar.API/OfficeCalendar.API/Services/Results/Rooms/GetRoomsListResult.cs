using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Rooms;

public abstract record GetRoomsListResult
{
    public sealed record Success(List<RoomModel> Rooms) : GetRoomsListResult;
    public sealed record Error(string Message) : GetRoomsListResult;
}