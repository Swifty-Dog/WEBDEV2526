namespace OfficeCalendar.API.Services.Results.Rooms;

public abstract record DeleteRoomResult
{
    public sealed record Success : DeleteRoomResult;
    public sealed record RoomNotFound : DeleteRoomResult;
    public sealed record Error(string Message) : DeleteRoomResult;
}
