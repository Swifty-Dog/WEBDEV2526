using OfficeCalendar.API.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5222);
});

builder.Services.AddAppServices(builder.Configuration);

var app = builder.Build();

app.ConfigureRequestPipeline();

app.Run();
