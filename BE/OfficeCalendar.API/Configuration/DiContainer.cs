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
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IRoomBookingRepository, RoomBookingRepository>();
        services.AddScoped<IAttendRepository, AttendRepository>();
        services.AddScoped<IRepository<EventModel>, Repository<EventModel>>();

        // JWT Token Generator: Scoped to avoid consuming scoped dependencies from a singleton.
        // If TokenService is stateless, it can still be scoped safely.
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();

        // Password Hasher: Must be Singleton as it is stateless and resource-intensive.
        services.AddSingleton<IPasswordHasher<EmployeeModel>, PasswordHasher<EmployeeModel>>();

        // Business Logic Services: Scoped to manage state per request.
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IRoomService, RoomService>();
        services.AddScoped<IRoomBookingService, RoomBookingService>();
        services.AddScoped<IAttendService, AttendService>();

        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<ITokenService, TokenService>();
    }
}
