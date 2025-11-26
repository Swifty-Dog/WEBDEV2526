using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;

namespace OfficeCalendar.API.Services;

public class AttendService : IAttendService
{
    private readonly IAttendRepository _repo;
    private readonly IRepository<EventModel> _events;

    public AttendService(IAttendRepository repo, IRepository<EventModel> events)
    {
        _repo = repo;
        _events = events;
    }

    public async Task<bool> Attend(long eventId, long employeeId)
    {
        if (eventId <= 0 || employeeId <= 0) return false;
        try
        {
            var ev = await _events.GetById(eventId);
            if (ev is null) return false;
            return await _repo.Attend(eventId, employeeId);
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> Unattend(long eventId, long employeeId)
    {
        if (eventId <= 0 || employeeId <= 0) return false;
        try
        {
            return await _repo.Unattend(eventId, employeeId);
        }
        catch
        {
            return false;
        }
    }
}
