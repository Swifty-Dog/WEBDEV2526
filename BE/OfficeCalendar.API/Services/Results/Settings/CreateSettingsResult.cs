using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Settings;

public abstract record CreateSettingsResult
{
    public sealed record Success(SettingsModel Settings) : CreateSettingsResult;
    public sealed record Error(string Message) : CreateSettingsResult;
}