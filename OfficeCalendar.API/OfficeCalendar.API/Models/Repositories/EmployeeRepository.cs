using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class EmployeeRepository : Repository<EmployeeModel>, IEmployeeRepository
{
    public EmployeeRepository(AppDbContext context) : base(context) { }

    public async Task<EmployeeModel?> GetByEmail(string email) =>
        await DbSet.FirstOrDefaultAsync(model => model.Email == email);
}
