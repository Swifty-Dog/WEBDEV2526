using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.RoomBookings;

public abstract record GetRoomBookingResult
{
    public sealed record Success(RoomBookingModel RoomBooking) : GetRoomBookingResult;
    public sealed record NotFound : GetRoomBookingResult;
    public sealed record Error(string Message) : GetRoomBookingResult;
}