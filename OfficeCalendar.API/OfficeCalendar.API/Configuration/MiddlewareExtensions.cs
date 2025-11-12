using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Hubs;

namespace OfficeCalendar.API.Configuration;

public static class MiddlewareExtensions
{
    public const string CorsPolicyName = "CalendrifyCorsPolicy";
    public static WebApplication ConfigureRequestPipeline(this WebApplication app)
    {
        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseHsts();
        }

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseHttpsRedirection();

        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseCors(CorsPolicyName);

        app.MapControllers();
        app.MapHub<RoomBookingHub>("/hubs/roomBookings");

        return app;
    }
}