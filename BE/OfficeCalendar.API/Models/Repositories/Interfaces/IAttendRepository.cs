using System.Threading.Tasks;
using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IAttendRepository
{
    Task<bool> Attend(long eventId, long employeeId);
    Task<bool> Unattend(long eventId, long employeeId);
}
