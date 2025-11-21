namespace OfficeCalendar.API.Services.Results.RoomBookings;

public abstract record DeleteRoomBookingResult
{
    public sealed record Success : DeleteRoomBookingResult;
    public sealed record NotFound(string Message) : DeleteRoomBookingResult;
    public sealed record Error(string Message) : DeleteRoomBookingResult;
}
