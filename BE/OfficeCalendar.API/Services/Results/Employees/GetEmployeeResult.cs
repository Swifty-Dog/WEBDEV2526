using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Employees;

public abstract record GetEmployeeResult
{
    public sealed record Success(EmployeeModel Employee) : GetEmployeeResult;
    public sealed record NotFound : GetEmployeeResult;
    public sealed record InvalidData(string Message) : GetEmployeeResult;
    public sealed record Error(string Message) : GetEmployeeResult;
}
