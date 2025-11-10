using OfficeCalendar.API.DTOs.RoomBookings.Request;
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

    public async Task<CreateRoomBookingResult> CreateRoomBooking(CreateRoomBookingDto dto, long id)
    {
        if (dto.EndTime <= dto.StartTime)
            return new CreateRoomBookingResult.InvalidData("Eindtijd kan niet voor de begintijd zijn.");

        var existingBooking = await GetRoomBookingByDateAndTime(dto.BookingDate, dto.StartTime, dto.EndTime, dto.RoomId);
        bool isRoomAvailable = existingBooking is GetRoomBookingResult.NotFound;
        if (!isRoomAvailable)
        {
            if (existingBooking is GetRoomBookingResult.Error error)
                return new CreateRoomBookingResult.Error(error.Message);
            return new CreateRoomBookingResult.RoomNotAvailable();
        }

        var roomBooking = new RoomBookingModel
        {
            RoomId = dto.RoomId,
            EmployeeId = id,
            BookingDate = dto.BookingDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Purpose = dto.Purpose
        };

        bool created = await _roomBookingRepo.Create(roomBooking);

        if (created)
            return new CreateRoomBookingResult.Success(roomBooking);

        return new CreateRoomBookingResult.Error("Kamerreservering niet kunnen maken.");
    }

    public async Task<GetRoomBookingListResult> GetUpcomingRoomBookingsByEmployeeId(long employeeId)
    {
        try
        {
            var roomBookings = await _roomBookingRepo.GetUpcomingBookingsByEmployeeId(employeeId);
            return new GetRoomBookingListResult.Success(roomBookings);
        }
        catch (Exception ex)
        {
            return new GetRoomBookingListResult.Error($"Fout bij het ophalen van kamerreserveringen: {ex.Message}");
        }
    }

    public async Task<GetRoomBookingListResult> GetRoomBookingsByDate(DateOnly date)
    {
        try
        {
            var roomBookings = await _roomBookingRepo.GetBookingsByDate(date);
            return new GetRoomBookingListResult.Success(roomBookings);
        }
        catch (Exception ex)
        {
            return new GetRoomBookingListResult.Error($"Fout bij ophalen van reserveringen op datum: {ex.Message}");
        }
    }
}