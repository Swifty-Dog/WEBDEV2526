using OfficeCalendar.API.DTOs.RoomBookings.Request;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.RoomBookings;

namespace OfficeCalendar.API.Services;

public class RoomBookingService : IRoomBookingService
{
    private readonly IRoomBookingRepository _roomBookingRepo;
    private readonly IRoomRepository _roomRepo;

    public RoomBookingService(IRoomBookingRepository roomBookingRepo, IRoomRepository roomRepo)
    {
        _roomBookingRepo = roomBookingRepo;
        _roomRepo = roomRepo;
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

        var roomModel = await _roomRepo.GetById(dto.RoomId);
        if (roomModel is null)
            return new CreateRoomBookingResult.InvalidData("Kamer niet gevonden.");

        var existingBooking = await GetRoomBookingByDateAndTime(dto.BookingDate, dto.StartTime, dto.EndTime, roomModel.Id);
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
            Room = roomModel,
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

    public async Task<UpdateRoomBookingResult> UpdateRoomBooking(long id, CreateRoomBookingDto dto, long employeeId)
    {
        try
        {
            var rb = await _roomBookingRepo.GetById(id);
            if (rb is null)
                return new UpdateRoomBookingResult.NotFound($"Kamerreservering met ID {dto.Id} niet gevonden.");

            var roomModel = await _roomRepo.GetByName(dto.RoomName);
            if (roomModel is null)
                return new UpdateRoomBookingResult.Error($"Kamer met naam {dto.RoomName} niet gevonden.");

            rb.Id = id;
            rb.RoomId = roomModel.Id;
            rb.BookingDate = dto.BookingDate;
            rb.StartTime = dto.StartTime;
            rb.EndTime = dto.EndTime;
            rb.Purpose = dto.Purpose;
            rb.EmployeeId = employeeId;


            bool updated = await _roomBookingRepo.Update(rb);
            if (updated)
                return new UpdateRoomBookingResult.Success(rb);

            return new UpdateRoomBookingResult.Error("Kamerreservering kon niet worden bijgewerkt.");
        }
        catch (Exception ex)
        {
            return new UpdateRoomBookingResult.Error($"Fout bij het bijwerken van de kamerreservering: {ex.Message}");
        }
    }

    public async Task<DeleteRoomBookingResult> DeleteRoomBooking(long id)
    {
        try
        {
            var rb = await _roomBookingRepo.GetById(id);
            if (rb is null)
                return new DeleteRoomBookingResult.NotFound($"Kamerreservering met ID {id} niet gevonden.");

            bool deleted = await _roomBookingRepo.Delete(rb);
            if (deleted)
                return new DeleteRoomBookingResult.Success();

            return new DeleteRoomBookingResult.Error("Kamerreservering kon niet worden verwijderd.");
        }
        catch (Exception ex)
        {
            return new DeleteRoomBookingResult.Error($"Fout bij het verwijderen van de kamerreservering: {ex.Message}");
        }
    }
}
