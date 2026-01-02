using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Settings;

public abstract record UpdateSettingsResult
{
    public sealed record Success(SettingsModel Settings) : UpdateSettingsResult;
    public sealed record NotFound(string Message) : UpdateSettingsResult;
    public sealed record InvalidData(string Message, Dictionary<string, string>? Arguments = null) : UpdateSettingsResult;
    public sealed record Unauthorized(string Message) : UpdateSettingsResult;
    public sealed record Error(string Message) : UpdateSettingsResult;
}
