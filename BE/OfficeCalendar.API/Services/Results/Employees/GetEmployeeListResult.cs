using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Employees;

public abstract record GetEmployeeListResult
{
    public sealed record Success(List<EmployeeModel> Employees, int TotalCount) : GetEmployeeListResult;
    public sealed record InvalidData(string Message) : GetEmployeeListResult;
    public sealed record Error(string Message) : GetEmployeeListResult;
}