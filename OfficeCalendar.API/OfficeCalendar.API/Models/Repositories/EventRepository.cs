using System.Globalization;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class EventRepository : Repository<EventModel>, IEventRepository
{
    public EventRepository(AppDbContext context) : base(context)
    {
    }

    public Task<List<EventModel>> GetAllEvents()
    {
        return DbSet
            .Include(e => e.CreatedBy)
            .Include(e => e.Room)
            .Include(e => e.EventParticipations)
            .ToListAsync();
    }

    public async Task<List<EventModel>> GetEventsByRoomAndDate(long roomId, DateTime eventDate)
    {
        return await DbSet
            .Include(e => e.EventParticipations)
            .Where(e =>
                e.RoomId == roomId &&
                e.EventDate == eventDate.Date)
            .ToListAsync();
    }

    public async Task<EventModel?> GetByIdWithIncludes(long id)
    {
        return await DbSet
            .Include(e => e.Room)
            .Include(e => e.EventParticipations)
            .FirstOrDefaultAsync(e => e.Id == id);
    }


}