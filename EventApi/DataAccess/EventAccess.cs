using Microsoft.EntityFrameworkCore;
using EventApi.Models;
namespace EventApi.Data;


public class EventAccess
{
    private readonly AppDbContext _context;

    public EventAccess(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Event?> GetAllEvents()
    {
        return new Event(1, "Sample", "Sample Event");
    }

    public async Task<Event> GetEventById()
    {
        return new Event(1, "Sample", "Sample Event");
    }
}


