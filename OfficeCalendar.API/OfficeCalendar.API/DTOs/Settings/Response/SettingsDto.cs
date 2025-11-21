using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.DTOs.Settings.Response;

public class SettingsDto
{
    public SiteThemeOption SiteTheme { get; set; }
    public UserThemeOption UserTheme { get; set; }
    public FontSizeOption FontSize { get; set; }
    public DefaultCalendarViewOption DefaultCalendarView { get; set; }
    public LanguageOption Language { get; set; }
}
