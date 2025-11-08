using OfficeCalendar.API.DTOs.RoomBookings;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.RoomBookings;

namespace OfficeCalendar.API.Services;

public class RoomBookingService : IRoomBookingService
{
    private readonly IRoomBookingRepository _roomBookingRepo;

    public RoomBookingService(IRoomBookingRepository roomBookingRepo)
    {
        _roomBookingRepo = roomBookingRepo;
    }

    public async Task<GetRoomBookingResult> GetRoomBookingByDateAndTime(DateOnly bookingDate, TimeOnly startTime, TimeOnly endTime, long roomId)
    {
        try
        {
            var roomBooking = await _roomBookingRepo.GetOverlappingBooking(bookingDate, startTime, endTime, (int)roomId);
            if (roomBooking != null)
                return new GetRoomBookingResult.Success(roomBooking);
            return new GetRoomBookingResult.NotFound();
        }
        catch (Exception ex)
        { return new GetRoomBookingResult.Error($"Fout bij het ophalen van de kamerreservering: {ex.Message}"); }
    }

    public async Task<CreateRoomBookingResult> CreateRoomBooking(CreateRoomBookingRequest request)
    {
        if (request.EndTime <= request.StartTime)
            return new CreateRoomBookingResult.InvalidData("Eindtijd kan niet voor de begintijd zijn.");

        var existingBooking = await GetRoomBookingByDateAndTime(request.BookingDate, request.StartTime, request.EndTime, request.RoomId);
        bool isRoomAvailable = existingBooking is GetRoomBookingResult.NotFound;
        if (!isRoomAvailable)
        {
            if (existingBooking is GetRoomBookingResult.Error error)
                return new CreateRoomBookingResult.Error(error.Message);
            return new CreateRoomBookingResult.RoomNotAvailable();
        }

        var roomBooking = new RoomBookingModel
        {
            RoomId = request.RoomId,
            EmployeeId = request.EmployeeId,
            BookingDate = request.BookingDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Purpose = request.Purpose
        };

        bool created = await _roomBookingRepo.Create(roomBooking);

        if (created)
            return new CreateRoomBookingResult.Success(roomBooking);

        return new CreateRoomBookingResult.Error("Kamerreservering niet kunnen maken.");
    }
}