namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IRoomRepository : IRepository<RoomModel>
{
    Task<RoomModel?> GetByName(string roomName);
}
