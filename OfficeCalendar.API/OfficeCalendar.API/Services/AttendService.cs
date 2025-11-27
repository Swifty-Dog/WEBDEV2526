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

    public async Task<AttendResult> Attend(long eventId, long employeeId)
    {
        if (eventId <= 0 || employeeId <= 0) return new AttendResult(AttendStatus.NotFound);
        try
        {
            var ev = await _events.GetById(eventId);
            if (ev is null) return new AttendResult(AttendStatus.NotFound);
            var ok = await _repo.Attend(eventId, employeeId);
            return new AttendResult(ok ? AttendStatus.Success : AttendStatus.Error);
        }
        catch
        {
            return new AttendResult(AttendStatus.Error);
        }
    }

    public async Task<AttendResult> Unattend(long eventId, long employeeId)
    {
        if (eventId <= 0 || employeeId <= 0) return new AttendResult(AttendStatus.NotFound);
        try
        {
            var ev = await _events.GetById(eventId);
            if (ev is null) return new AttendResult(AttendStatus.NotFound);
            var ok = await _repo.Unattend(eventId, employeeId);
            return new AttendResult(ok ? AttendStatus.Success : AttendStatus.NoChange);
        }
        catch
        {
            return new AttendResult(AttendStatus.Error);
        }
    }
}
