using OfficeCalendar.API.DTOs.RoomBookings;
using OfficeCalendar.API.Services.Results.RoomBookings;

namespace OfficeCalendar.API.Services.Interfaces;

public interface IRoomBookingService
{
    Task<CreateRoomBookingResult> CreateRoomBooking(CreateRoomBookingRequest request);
}
