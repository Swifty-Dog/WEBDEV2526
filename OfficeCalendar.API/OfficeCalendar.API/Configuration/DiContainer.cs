using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services;
using OfficeCalendar.API.Services.Interfaces;

namespace OfficeCalendar.API.Configuration;

public static class DiContainer
{
    public static void AddOfficeCalendarServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        // Repository: Scoped. New instance per HTTP request.
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();

        // JWT Token Generator: Must be Singleton as it is stateless and reads configuration.
        services.AddSingleton<ITokenService, TokenService>();

        // Password Hasher: Must be Singleton as it is stateless and resource-intensive.
        services.AddSingleton<IPasswordHasher<EmployeeModel>, PasswordHasher<EmployeeModel>>();

        // Business Logic Services: Scoped to manage state per request.
        services.AddScoped<IEmployeeService, EmployeeService>();

    }
}
