using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Employees;

public abstract record RegisterResult
{
    public sealed record Success(EmployeeModel Employee) : RegisterResult;
    public sealed record EmailAlreadyExists : RegisterResult;
    public sealed record InvalidData(string Message) : RegisterResult;
    public sealed record Error(string Message) : RegisterResult;
}