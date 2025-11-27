using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Tokens;

namespace OfficeCalendar.API.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;
    private readonly IRepository<EmployeeModel> _employeeRepo;

    public TokenService(IConfiguration config, IRepository<EmployeeModel> employeeRepo)
    {
        _config = config;
        _employeeRepo = employeeRepo;
    }

    public CreateJwtResult GenerateToken(EmployeeModel employee)
    {
        var secretKey = _config["Jwt:Key"];
        var issuer = _config["Jwt:Issuer"] ?? "OfficeCalendarAPI";
        var audience = _config["Jwt:Audience"] ?? "OfficeCalendarUsers";

        if (string.IsNullOrEmpty(secretKey))
            return new CreateJwtResult.ConfigError("tokens.API_ErrorTokenConfig");

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
            expires: DateTime.UtcNow.AddMinutes(15),
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
                ClockSkew = TimeSpan.Zero
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
        var handler = new JwtSecurityTokenHandler();

        if (handler.CanReadToken(token))
        {
            var jwtToken = handler.ReadJwtToken(token);
            var claim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (claim != null && long.TryParse(claim.Value, out var employeeId))
                return employeeId;
        }

        return null;
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public async Task<TokenRefreshResult> RefreshToken(string refreshToken)
    {
        var employee = await _employeeRepo.GetSingle(e => e.RefreshToken == refreshToken);

        if (employee is null || employee.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return new TokenRefreshResult.InvalidToken("tokens.API_ErrorInvalidRefreshToken");

        var newJwtResult = GenerateToken(employee);
        if (newJwtResult is not CreateJwtResult.Success jwtSuccess)
            return new TokenRefreshResult.Error("tokens.API_ErrorTokenGenerationFailed");

        var newRefreshToken = GenerateRefreshToken();
        employee.RefreshToken = newRefreshToken;
        employee.RefreshTokenExpiryTime = GetRefreshTokenExpiryTime();

        await _employeeRepo.Update(employee);
        return new TokenRefreshResult.Success(jwtSuccess.Token, newRefreshToken);
    }

    public DateTime GetRefreshTokenExpiryTime() => DateTime.UtcNow.AddDays(7);
}
