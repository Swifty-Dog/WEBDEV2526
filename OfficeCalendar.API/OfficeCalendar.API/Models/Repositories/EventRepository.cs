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
            .ToListAsync();
    }

}