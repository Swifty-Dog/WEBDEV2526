using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Settings;

public abstract record GetSettingsResult
{
    public sealed record Success(SettingsModel Settings) : GetSettingsResult;
    public sealed record NotFound : GetSettingsResult;
    public sealed record UserNotFound : GetSettingsResult;
    public sealed record Error(string Message) : GetSettingsResult;
}
