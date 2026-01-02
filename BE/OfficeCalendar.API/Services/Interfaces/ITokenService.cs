using System.Security.Claims;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Services.Results.Tokens;

namespace OfficeCalendar.API.Services.Interfaces;

public interface ITokenService
{
    CreateJwtResult GenerateToken(EmployeeModel employee);
    ClaimsPrincipal? ValidateToken(string token);
    long? GetEmployeeIdFromToken(string token);
    string GenerateRefreshToken();
    Task<TokenRefreshResult> RefreshToken(string refreshToken);
    DateTime GetRefreshTokenExpiryTime();
}