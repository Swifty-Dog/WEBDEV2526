using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.RoomBookings;

public abstract record GetRoomBookingListResult
{
    public sealed record Success(List<RoomBookingModel> RoomBookings) : GetRoomBookingListResult;
    public sealed record Error(string Message) : GetRoomBookingListResult;
}
