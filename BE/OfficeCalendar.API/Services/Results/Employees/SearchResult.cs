using Microsoft.AspNetCore.Mvc;
using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services.Results.Employees;

public abstract record SearchResults
{
    public sealed record Success(List<EmployeeModel> Employees) : SearchResults;
    public sealed record NoResultsFound : SearchResults;
    public sealed record Error(string Message) : SearchResults;
    public sealed record InvalidData(string Message) : SearchResults;
}