using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Tokens;

namespace OfficeCalendar.API.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public CreateJwtResult GenerateToken(EmployeeModel employee)
    {
        var secretKey = _config["Jwt:Key"];
        var issuer = _config["Jwt:Issuer"] ?? "OfficeCalendarAPI";
        var audience = _config["Jwt:Audience"] ?? "OfficeCalendarUsers";

        if (string.IsNullOrEmpty(secretKey))
            return new CreateJwtResult.ConfigError("JWT secret key is not configured.");

        var claims = new List<Claim>
        {
            new (ClaimTypes.NameIdentifier, employee.Id.ToString()),
            new (ClaimTypes.Name, employee.FullName),
            new (ClaimTypes.Email, employee.Email),
            new (ClaimTypes.Role, employee.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials);

        return new CreateJwtResult.Success(new JwtSecurityTokenHandler().WriteToken(token));
    }
}