using OfficeCalendar.API.DTOs.Settings.Response;

namespace OfficeCalendar.API.Services.Results.Settings;

public abstract record GetSettingsResult
{
    public sealed record Success(SettingsDto Settings) : GetSettingsResult;
    public sealed record NotFound : GetSettingsResult;
    public sealed record UserNotFound : GetSettingsResult;
    public sealed record Error(string Message) : GetSettingsResult;
}
