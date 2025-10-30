using OfficeCalendar.API.DTOs.Employees.Response;

namespace OfficeCalendar.API.Services.Results.Employees;

public abstract record LoginResult
{
    public sealed record Success(AuthDto Dto) : LoginResult;
    public sealed record InvalidCredentials(string Message) : LoginResult;
    public sealed record NotFound : LoginResult;
    public sealed record Error(string Message) : LoginResult;
}
