namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IEmployeeRepository : IRepository<EmployeeModel>
{
    Task<EmployeeModel?> GetByEmail(string email);
}
