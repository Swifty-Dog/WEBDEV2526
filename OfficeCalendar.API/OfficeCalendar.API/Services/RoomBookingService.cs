using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;

namespace OfficeCalendar.API.Services;

public class RoomBookingService : IRoomBookingService
{
    private readonly IRoomBookingRepository _roomBookingRepo;

    public RoomBookingService(IRoomBookingRepository roomBookingRepo)
    {
        _roomBookingRepo = roomBookingRepo;
    }


}