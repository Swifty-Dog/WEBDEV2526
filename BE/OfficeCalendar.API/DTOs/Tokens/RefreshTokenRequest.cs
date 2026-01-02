using System.ComponentModel.DataAnnotations;

namespace OfficeCalendar.API.DTOs.Tokens;

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}