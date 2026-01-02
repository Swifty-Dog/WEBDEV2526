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

    // Voor 1 event
    public async Task<EventModel?> GetEventById(long id)
    {
        return await DbSet
            .Include(e => e.Room)
            .Include(e => e.EventParticipations)
                .ThenInclude(ep => ep.Employee)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    // Voor alle events
    public async Task<List<EventModel>> GetAllEvents()
    {
        return await DbSet
            .Include(e => e.Room)
            .Include(e => e.EventParticipations)
                .ThenInclude(ep => ep.Employee)
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

    public async Task<List<EventModel>> GetEventsPastDateIncluding(DateTime date)
    {
        return await DbSet
            .Include(e => e.Room)
            .Include(e => e.EventParticipations)
                .ThenInclude(ep => ep.Employee)
            .Where(e => e.EventDate >= date.Date)
            .ToListAsync();
    }
}