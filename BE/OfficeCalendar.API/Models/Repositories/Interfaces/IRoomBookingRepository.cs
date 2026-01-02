namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IRoomBookingRepository : IRepository<RoomBookingModel>
{
    Task<RoomBookingModel?> GetOverlappingBooking(DateOnly bookingDate, TimeOnly startTime, TimeOnly endTime, long roomId);
    Task<List<RoomBookingModel>> GetUpcomingBookingsByEmployeeId(long employeeId);
    Task<List<RoomBookingModel>> GetUpcomingByEmployeeIdExcludeEvents(long employeeId);
    Task<List<RoomBookingModel>> GetBookingsByDate(DateOnly date);
    Task<RoomBookingModel?> GetByEventId(long eventId);

    Task<bool> HasConflict(long roomId, DateOnly date, TimeOnly start, TimeOnly end, long? ignoreEventId = null);
}