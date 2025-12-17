using OfficeCalendar.API.DTOs.Settings.Request;
using OfficeCalendar.API.Services.Results.Settings;

namespace OfficeCalendar.API.Services.Interfaces;

public interface ISettingsService
{
    Task<CreateSettingsResult> CreateSettingsForNewUser(long employeeId);
    Task<GetSettingsResult> GetSettingsByEmployeeId(long employeeId);
    Task<UpdateSettingsResult> UpdateSettings(UpdateSettingsDto dto);
    Task<UpdateSettingsResult> ResetSettingsToDefault(long? employeeId = null);
}
