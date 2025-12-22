namespace OfficeCalendar.API.Services.Results.Employees;

public abstract record TerminateEmployeeResult
{
    public sealed record Success : TerminateEmployeeResult;
    public sealed record NotFound : TerminateEmployeeResult;
    public sealed record InvalidData(string Message) : TerminateEmployeeResult;
    public sealed record Error(string Message) : TerminateEmployeeResult;
}