using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class AttendRepository : IAttendRepository
{
    private readonly AppDbContext _context;

    public AttendRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Attend(long eventId, long employeeId)
    {
        var exists = await _context.EventParticipations
            .AnyAsync(p => p.EventId == eventId && p.EmployeeId == employeeId);
        if (exists) return true;

        await _context.EventParticipations.AddAsync(new EventParticipationModel
        {
            EventId = eventId,
            EmployeeId = employeeId
        });

        var written = await _context.SaveChangesAsync();
        return written > 0;
    }

    public async Task<bool> Unattend(long eventId, long employeeId)
    {
        var existing = await _context.EventParticipations
            .FirstOrDefaultAsync(p => p.EventId == eventId && p.EmployeeId == employeeId);
        if (existing is null) return false;

        _context.EventParticipations.Remove(existing);
        var written = await _context.SaveChangesAsync();
        return written > 0;
    }
}
