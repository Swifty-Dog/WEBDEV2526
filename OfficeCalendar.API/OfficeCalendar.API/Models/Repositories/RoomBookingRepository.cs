using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class RoomBookingRepository : Repository<RoomBookingModel>, IRoomBookingRepository
{
    public RoomBookingRepository(AppDbContext context) : base(context) { }

}
