namespace OfficeCalendar.API.Services.Interfaces;

public enum AttendStatus
{
    Success,
    NotFound,
    NoChange,
    Error
}

public record AttendResult(AttendStatus Status);

public interface IAttendService
{
    Task<AttendResult> Attend(long eventId, long employeeId);
    Task<AttendResult> Unattend(long eventId, long employeeId);
    Task<List<string>> GetAttendeeNames(long eventId);
    Task<bool> IsUserAttending(long eventId, long employeeId);
}
