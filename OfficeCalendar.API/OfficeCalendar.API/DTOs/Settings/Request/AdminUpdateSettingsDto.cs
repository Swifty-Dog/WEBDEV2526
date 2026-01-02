namespace OfficeCalendar.API.DTOs.Settings.Request;

public class AdminUpdateSettingsDto : UpdateSettingsDto
{
    public long? EmployeeId { get; set; }
}