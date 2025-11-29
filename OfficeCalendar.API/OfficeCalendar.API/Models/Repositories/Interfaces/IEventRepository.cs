using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IEventRepository : IRepository<EventModel>
{

    Task<List<EventModel>> GetAllEvents();


}