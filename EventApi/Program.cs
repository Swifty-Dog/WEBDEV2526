using Microsoft.EntityFrameworkCore;
using EventApi.Data;

var builder = WebApplication.CreateBuilder(args);

// EF Core registreren met SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
var app = builder.Build();

app.MapControllers();
app.Run();
