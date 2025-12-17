using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.DTOs.Settings.Request;

public class UpdateSettingsDto
{
    public SiteThemeOption? SiteTheme { get; set; }
    public AccentColorOption? AccentColor { get; set; }
    public FontSizeOption? FontSize { get; set; }
    public DefaultCalendarViewOption? DefaultCalendarView { get; set; }
    public LanguageOption? Language { get; set; }
}
