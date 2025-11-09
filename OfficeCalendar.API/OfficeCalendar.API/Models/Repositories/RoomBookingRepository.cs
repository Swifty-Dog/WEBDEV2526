using System.Globalization;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class RoomBookingRepository : Repository<RoomBookingModel>, IRoomBookingRepository
{
    public RoomBookingRepository(AppDbContext context) : base(context)
    {
    }

    public Task<RoomBookingModel?> GetOverlappingBooking(DateOnly bookingDate, TimeOnly startTime, TimeOnly endTime,
        long roomId)
    {
        return DbSet.FirstOrDefaultAsync(rb =>
            rb.BookingDate == bookingDate &&
            rb.RoomId == roomId &&
            rb.StartTime < endTime &&
            rb.EndTime > startTime);
    }

    public Task<List<RoomBookingModel>> GetUpcomingBookingsByEmployeeId(long employeeId)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var currentTime = TimeOnly.FromDateTime(now);

        return DbSet
            .Include(rb => rb.Room)
            .Where(rb => rb.EmployeeId == employeeId && (rb.BookingDate > today ||
                                                         (rb.BookingDate == today && rb.EndTime > currentTime)))
            .OrderBy(rb => rb.BookingDate)
            .ThenBy(rb => rb.StartTime)
            .ToListAsync();
    }
}
