using System.Security.Claims;
using OfficeCalendar.API.DTOs.Settings.Request;
using OfficeCalendar.API.DTOs.Settings.Response;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Settings;

namespace OfficeCalendar.API.Services;

public class SettingsService : ISettingsService
{
    private readonly IRepository<SettingsModel> _settings;
    private readonly IHttpContextAccessor _httpContext;

    public SettingsService(IRepository<SettingsModel> settings, IHttpContextAccessor httpContext)
    {
        _settings = settings;
        _httpContext = httpContext;
    }

    public async Task<CreateSettingsResult> CreateSettingsForNewUser(long employeeId)
    {
        try
        {
            var newSettings = new SettingsModel { EmployeeId = employeeId };
            var created = await _settings.Create(newSettings);

            return created
                ? new CreateSettingsResult.Success(newSettings)
                : new CreateSettingsResult.Error("settings.API_ErrorSaveFailed");
        }
        catch (Exception)
        {
            return new CreateSettingsResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<GetSettingsResult> GetSettingsByEmployeeId(long employeeId)
    {
        try
        {
            var settings = await _settings.GetById(employeeId);

            if (settings is null)
                return new GetSettingsResult.NotFound("settings.API_ErrorNotFound");

            var settingsDto = new SettingsDto
            {
                SiteTheme = settings.SiteTheme,
                AccentColor = settings.AccentColor,
                FontSize = (int)settings.FontSize,
                DefaultCalendarView = settings.DefaultCalendarView,
                Language = settings.Language
            };

            return new GetSettingsResult.Success(settingsDto);
        }
        catch (Exception)
        {
            return new GetSettingsResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<UpdateSettingsResult> UpdateSettings(UpdateSettingsDto update)
    {
        try
        {
            var invalidDataResult = ValidateDto(update);
            if (invalidDataResult is not null)
                return invalidDataResult;

            var (targetEmployeeId, error) = GetTargetEmployeeId(update);
            if (error is not null) return error;

            var settings = await _settings.GetById(targetEmployeeId);
            if (settings is null)
                return new UpdateSettingsResult.NotFound("settings.API_ErrorNotFound");

            settings.SiteTheme = update.SiteTheme ?? settings.SiteTheme;
            settings.AccentColor = update.AccentColor ?? settings.AccentColor;
            settings.FontSize = update.FontSize ?? settings.FontSize;
            settings.DefaultCalendarView = update.DefaultCalendarView ?? settings.DefaultCalendarView;
            settings.Language = update.Language ?? settings.Language;

            bool updated = await _settings.Update(settings);
            return updated
                ? new UpdateSettingsResult.Success(settings)
                : new UpdateSettingsResult.Error("settings.API_ErrorSaveFailed");
        }
        catch (Exception)
        {
            return new UpdateSettingsResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<UpdateSettingsResult> ResetSettingsToDefault(long? employeeId = null)
    {
        var defaultDto = new AdminUpdateSettingsDto
        {
            EmployeeId = employeeId,
            SiteTheme = SettingsModel.DefaultSiteTheme,
            AccentColor = SettingsModel.DefaultAccentColor,
            FontSize = SettingsModel.DefaultFontSize,
            DefaultCalendarView = SettingsModel.DefaultDefaultCalendarView,
            Language = SettingsModel.DefaultLanguage
        };

        return await UpdateSettings(defaultDto);
    }

    private static UpdateSettingsResult? ValidateDto(UpdateSettingsDto dto)
    {
        var properties = dto.GetType().GetProperties();

        foreach (var prop in properties)
        {
            var value = prop.GetValue(dto);
            if (value is null) continue;

            var type = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;

            if (!type.IsEnum) continue;
            if (!Enum.IsDefined(type, value))
                return new UpdateSettingsResult.InvalidData("settings.API_ErrorInvalidDataValue",
                    new Dictionary<string, string> {
                        { "field", prop.Name },
                        { "value", value.ToString()! }
                    });
        }

        return null;
    }

    private (long employeeId, UpdateSettingsResult? Error) GetTargetEmployeeId(UpdateSettingsDto update)
    {
        var user = _httpContext.HttpContext?.User;
        if (user is null || !user.Identity!.IsAuthenticated)
            return (0, new UpdateSettingsResult.Unauthorized("general.API_ErrorInvalidSession"));

        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim is null || !long.TryParse(idClaim.Value, out long currentUserId))
            return (0, new UpdateSettingsResult.Unauthorized("general.API_ErrorInvalidSession"));

        long targetEmployeeId = currentUserId;

        if (update is AdminUpdateSettingsDto adminUpdate && adminUpdate.EmployeeId.HasValue)
        {
            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim != "Admin")
                return (0, new UpdateSettingsResult.Unauthorized("settings.API_ErrorUnauthorized"));

            targetEmployeeId = adminUpdate.EmployeeId.Value;
        }

        return (targetEmployeeId, null);
    }
}
