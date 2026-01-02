using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.RoomBookings;

public abstract record UpdateRoomBookingResult
{
    public sealed record Success(RoomBookingModel RoomBooking) : UpdateRoomBookingResult;
    public sealed record NotFound(string Message, Dictionary<string, string>? Arguments = null) : UpdateRoomBookingResult;
    public sealed record Error(string Message, Dictionary<string, string>? Arguments = null) : UpdateRoomBookingResult;
}
