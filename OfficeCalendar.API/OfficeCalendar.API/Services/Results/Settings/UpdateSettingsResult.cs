using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Settings;

public abstract record UpdateSettingsResult
{
    public sealed record Success(SettingsModel Settings) : UpdateSettingsResult;
    public sealed record NotFound : UpdateSettingsResult;
    public sealed record InvalidData(string Message) : UpdateSettingsResult;
    public sealed record Unauthorized : UpdateSettingsResult;
    public sealed record Error(string Message) : UpdateSettingsResult;
}