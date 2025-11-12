using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace OfficeCalendar.API.Configuration;

public static class ServiceExtensions
{
    public static IServiceCollection AddAppServices(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSecretKey = configuration["Jwt:Key"]
                           ?? throw new InvalidOperationException("JWT Secret Key 'Jwt:Key' is missing in configuration. It must be set via secrets.");
        var issuer = configuration["Jwt:Issuer"] ?? "CalendifyAPI";
        var audience = configuration["Jwt:Audience"] ?? "CalendifyUsers";

        services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState.Values
                        .SelectMany(entry => entry.Errors)
                        .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage) ?
                            error.Exception?.Message ?? "A validation error occurred." :
                            error.ErrorMessage)
                        .ToList();

                    return new BadRequestObjectResult(new { errors });
                };
            });

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
                    ClockSkew = TimeSpan.Zero
                };
            });

        AddCorsPolicy(services, configuration, MiddlewareExtensions.CorsPolicyName);
        services.AddOfficeCalendarServices(configuration);
        services.AddSwaggerAuthorization();

        return services;
    }

    private static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration, string policyName)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(name: policyName,
                policy =>
                {
                    policy.WithOrigins("https://localhost:5173", "http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });
        return services;
    }
}