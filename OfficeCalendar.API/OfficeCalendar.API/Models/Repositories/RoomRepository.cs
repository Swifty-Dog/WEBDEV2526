using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class RoomRepository : Repository<RoomModel>, IRoomRepository
{
    public RoomRepository(AppDbContext context) : base(context) { }

    public async Task<RoomModel?> GetByName(string roomName)
    {
        return await Context.Rooms
            .FirstOrDefaultAsync(room => EF.Functions.Like(room.RoomName.ToLower(), roomName.ToLower()));
    }
}
