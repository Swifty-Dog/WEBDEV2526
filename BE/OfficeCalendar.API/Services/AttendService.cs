using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;

namespace OfficeCalendar.API.Services;

public class AttendService : IAttendService
{
    private readonly IAttendRepository _repo;
    private readonly IRepository<EventModel> _events;
    private readonly IRepository<EventParticipationModel> _participations;

    public AttendService(IAttendRepository repo, IRepository<EventModel> events, IRepository<EventParticipationModel> participations)
    {
        _repo = repo;
        _events = events;
        _participations = participations;
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

    public async Task<List<string>> GetAttendeeNames(long eventId) => await _repo.GetAttendeeNames(eventId);

    public async Task<bool> IsUserAttending(long eventId, long userId)
    {
        var participations = await _participations.GetAllFiltered(ep => ep.EventId == eventId && ep.EmployeeId == userId);
        return participations.Count != 0;
    }
}