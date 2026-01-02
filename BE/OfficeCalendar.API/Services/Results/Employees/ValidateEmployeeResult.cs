namespace OfficeCalendar.API.Services.Results.Employees;

public abstract record ValidateEmployeeResult
{
    public sealed record Success(long EmployeeId) : ValidateEmployeeResult;
    public sealed record NotFound : ValidateEmployeeResult;
    public sealed record Inactive : ValidateEmployeeResult;
    public sealed record Unauthorized : ValidateEmployeeResult;
    public sealed record Error(string Message) : ValidateEmployeeResult;
}