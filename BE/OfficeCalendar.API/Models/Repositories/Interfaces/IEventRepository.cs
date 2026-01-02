using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IEventRepository : IRepository<EventModel>
{

    Task<List<EventModel>> GetAllEvents();
    Task<List<EventModel>> GetEventsByRoomAndDate(long roomId, DateTime eventDate);
    Task<EventModel?> GetEventById(long id);
    Task<List<EventModel>> GetEventsPastDateIncluding(DateTime date);


}