using OfficeCalendar.API.Models;
using OfficeCalendar.API.Services.Results.Tokens;

namespace OfficeCalendar.API.Services.Interfaces;

public interface ITokenService
{
    CreateJwtResult GenerateToken(EmployeeModel employee);
}