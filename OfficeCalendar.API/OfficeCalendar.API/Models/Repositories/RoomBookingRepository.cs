using System.Globalization;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class RoomBookingRepository : Repository<RoomBookingModel>, IRoomBookingRepository
{
    public RoomBookingRepository(AppDbContext context) : base(context) { }

    public Task<RoomBookingModel?> GetOverlappingBooking(DateOnly bookingDate, TimeOnly startTime, TimeOnly endTime, long roomId)
    {
        return DbSet.FirstOrDefaultAsync(rb =>
            rb.BookingDate == bookingDate &&
            rb.RoomId == roomId &&
            rb.StartTime < endTime &&
            rb.EndTime > startTime);
    }
}
