using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.RoomBookings;

public abstract record CreateRoomBookingResult
{
    public sealed record Success(RoomBookingModel RoomBooking) : CreateRoomBookingResult;
    public sealed record RoomNotAvailable : CreateRoomBookingResult;
    public sealed record InvalidData(string Message, Dictionary<string, string>? Arguments = null) : CreateRoomBookingResult;
    public sealed record Error(string Message) : CreateRoomBookingResult;
}
