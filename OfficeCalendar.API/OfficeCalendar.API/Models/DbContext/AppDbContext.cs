using Microsoft.EntityFrameworkCore;

namespace OfficeCalendar.API.Models.DbContext;

public class AppDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<EmployeeModel> Employees => Set<EmployeeModel>();
}