using System.Security.Claims;
using OfficeCalendar.API.DTOs.Settings.Request;
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
                : new CreateSettingsResult.Error("Failed to create settings.");
        }
        catch (Exception ex)
        {
            return new CreateSettingsResult.Error(ex.Message);
        }
    }

    public async Task<GetSettingsResult> GetSettingsByEmployeeId(long employeeId)
    {
        try
        {
            var settings = await _settings.GetById(employeeId);
            return settings is not null
                ? new GetSettingsResult.Success(settings)
                : new GetSettingsResult.NotFound();
        }
        catch (Exception ex)
        {
            return new GetSettingsResult.Error(ex.Message);
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
                return new UpdateSettingsResult.NotFound();

            settings.SiteTheme = update.SiteTheme ?? settings.SiteTheme;
            settings.UserTheme = update.UserTheme ?? settings.UserTheme;
            settings.FontSize = update.FontSize ?? settings.FontSize;
            settings.DefaultCalendarView = update.DefaultCalendarView ?? settings.DefaultCalendarView;
            settings.Language = update.Language ?? settings.Language;

            await _settings.Update(settings);
            return new UpdateSettingsResult.Success(settings);
        }
        catch (Exception ex)
        {
            return new UpdateSettingsResult.Error(ex.Message);
        }
    }

    public async Task<UpdateSettingsResult> ResetSettingsToDefault(long? employeeId = null)
    {
        var defaultDto = new AdminUpdateSettingsDto
        {
            EmployeeId = employeeId,
            SiteTheme = SettingsModel.DefaultSiteTheme,
            UserTheme = SettingsModel.DefaultUserTheme,
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
                return new UpdateSettingsResult.InvalidData($"Invalid {prop.Name} value: {value}");
        }

        return null;
    }

    private (long employeeId, UpdateSettingsResult? Error) GetTargetEmployeeId(UpdateSettingsDto update)
    {
        var user = _httpContext.HttpContext?.User;
        if (user is null || !user.Identity!.IsAuthenticated)
            return (0, new UpdateSettingsResult.Unauthorized());

        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim is null || !long.TryParse(idClaim.Value, out long currentUserId))
            return (0, new UpdateSettingsResult.Unauthorized());

        long targetEmployeeId = currentUserId;

        if (update is AdminUpdateSettingsDto adminUpdate && adminUpdate.EmployeeId.HasValue)
        {
            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim != "Admin")
                return (0, new UpdateSettingsResult.Unauthorized());

            targetEmployeeId = adminUpdate.EmployeeId.Value;
        }

        return (targetEmployeeId, null);
    }
}
