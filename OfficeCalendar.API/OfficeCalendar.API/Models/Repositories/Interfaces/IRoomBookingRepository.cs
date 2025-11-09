namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IRoomBookingRepository : IRepository<RoomBookingModel>
{
    Task<RoomBookingModel?> GetOverlappingBooking(DateOnly bookingDate, TimeOnly startTime, TimeOnly endTime, long roomId);
    Task<List<RoomBookingModel>> GetUpcomingBookingsByEmployeeId(long employeeId);
    Task<List<RoomBookingModel>> GetBookingsByDate(DateOnly date);
}