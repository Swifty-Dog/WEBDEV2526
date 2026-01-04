using OfficeCalendar.API.DTOs.RoomBookings.Request;
using OfficeCalendar.API.Services.Results.RoomBookings;

namespace OfficeCalendar.API.Services.Interfaces;

public interface IRoomBookingService
{
    Task<CreateRoomBookingResult> CreateRoomBooking(CreateRoomBookingDto dto, long id);
    Task<GetRoomBookingListResult> GetUpcomingRoomBookingsByEmployeeId(long employeeId);
    Task<GetRoomBookingListResult> GetUpcomingRoomBookingsByEmployeeIdExcludeEvents(long employeeId);
    Task<GetRoomBookingListResult> GetRoomBookingsByDate(DateOnly date);
    Task<UpdateRoomBookingResult> UpdateRoomBooking(long id, CreateRoomBookingDto dto, long employeeId);
    Task<DeleteRoomBookingResult> DeleteRoomBooking(long bookingId);
}
