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
            return new CreateJwtResult.ConfigError("employees.API_ErrorTokenConfig");

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
            expires: DateTime.UtcNow.AddHours(1).ToLocalTime(),
            signingCredentials: credentials);

        return new CreateJwtResult.Success(new JwtSecurityTokenHandler().WriteToken(token));
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var secretKey = _config["Jwt:Key"];
        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];

        if (string.IsNullOrEmpty(secretKey))
            return null;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secretKey);

            var parameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),

                ValidateIssuer = true,
                ValidIssuer = issuer,

                ValidateAudience = true,
                ValidAudience = audience,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1)
            };

            return tokenHandler.ValidateToken(token, parameters, out _);
        }
        catch
        {
            return null;
        }
    }

    public long? GetEmployeeIdFromToken(string token)
    {
        var principal = ValidateToken(token);

        var claim = principal?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

        if (claim != null && long.TryParse(claim.Value, out var employeeId))
            return employeeId;

        return null;
    }
}
