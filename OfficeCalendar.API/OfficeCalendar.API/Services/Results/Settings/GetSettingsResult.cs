using OfficeCalendar.API.DTOs.Settings.Response;

namespace OfficeCalendar.API.Services.Results.Settings;

public abstract record GetSettingsResult
{
    public sealed record Success(SettingsDto Settings) : GetSettingsResult;
    public sealed record NotFound(string Message) : GetSettingsResult;
    public sealed record UserNotFound(string Message) : GetSettingsResult;
    public sealed record Error(string Message) : GetSettingsResult;
}
