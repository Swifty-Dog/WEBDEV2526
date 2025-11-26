namespace OfficeCalendar.API.Services.Interfaces;

public interface IAttendService
{
    Task<bool> Attend(long eventId, long employeeId);
    Task<bool> Unattend(long eventId, long employeeId);
}
