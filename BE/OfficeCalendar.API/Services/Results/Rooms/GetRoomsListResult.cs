using OfficeCalendar.API.DTOs.Rooms.Response;

namespace OfficeCalendar.API.Services.Results.Rooms;

public abstract record GetRoomsListResult
{
    public sealed record Success(List<RoomNameDto> Rooms) : GetRoomsListResult;
    public sealed record Error(string Message) : GetRoomsListResult;
}