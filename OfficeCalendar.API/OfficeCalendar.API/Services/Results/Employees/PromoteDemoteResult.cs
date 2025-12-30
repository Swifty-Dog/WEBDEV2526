using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Employees;

public abstract record PromoteDemoteResult
{
    public sealed record Success(EmployeeModel Employee) : PromoteDemoteResult;
    public sealed record NotFound : PromoteDemoteResult;
    public sealed record InvalidData(string Message) : PromoteDemoteResult;
    public sealed record Error(string Message) : PromoteDemoteResult;
}