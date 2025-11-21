using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OfficeCalendar.API.Models;

public enum SiteThemeOption
{
    Light,
    Dark
}

public enum UserThemeOption
{
    Blue,
    Purple,
    Orange,
    Yellow
}

public enum FontSizeOption
{
    Small = 14,
    Medium = 16,
    Large = 18,
    ExtraLarge = 20
}

public enum DefaultCalendarViewOption
{
    Week,
    Month
}

public enum LanguageOption
{
    English,
    Dutch
}

public class SettingsModel
{
    [Key]
    public long EmployeeId { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public EmployeeModel Employee { get; set; } = null!;

    [Required]
    public SiteThemeOption SiteTheme { get; set; } = DefaultSiteTheme;

    [Required]
    public UserThemeOption UserTheme { get; set; } = DefaultUserTheme;

    [Required]
    public FontSizeOption FontSize { get; set; } = DefaultFontSize;

    [Required]
    public DefaultCalendarViewOption DefaultCalendarView { get; set; } = DefaultDefaultCalendarView;

    [Required]
    public LanguageOption Language { get; set; } = DefaultLanguage;

    public const SiteThemeOption DefaultSiteTheme = SiteThemeOption.Light;
    public const UserThemeOption DefaultUserTheme = UserThemeOption.Blue;
    public const FontSizeOption DefaultFontSize = FontSizeOption.Medium;
    public const DefaultCalendarViewOption DefaultDefaultCalendarView = DefaultCalendarViewOption.Week;
    public const LanguageOption DefaultLanguage = LanguageOption.English;
}
