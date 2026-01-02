using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class EmployeeRepository : Repository<EmployeeModel>, IEmployeeRepository
{
    public EmployeeRepository(AppDbContext context) : base(context) { }

}
