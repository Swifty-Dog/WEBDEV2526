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

            var roomBooking = await _roomBookingRepo.GetOverlappingBooking(bookingDate, startTime, endTime, roomId);
            if (roomBooking != null)
                return new GetRoomBookingResult.Success(roomBooking);
            return new GetRoomBookingResult.NotFound();
        }
        catch (Exception)
        {
            return new GetRoomBookingResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<CreateRoomBookingResult> CreateRoomBooking(CreateRoomBookingDto dto, long id)
    {
        if (dto.EndTime <= dto.StartTime)
            return new CreateRoomBookingResult.InvalidData("roomBookings.API_ErrorEndBeforeStart");

        var roomModel = await _roomRepo.GetById(dto.RoomId);
        if (roomModel is null)
            return new CreateRoomBookingResult.InvalidData("rooms.API_ErrorNotFoundById",
                new Dictionary<string, string> { { "id", dto.RoomId.ToString() } });

        var hasConflict = await _roomBookingRepo.HasConflict(dto.RoomId, dto.BookingDate, dto.StartTime, dto.EndTime);
        if (hasConflict)
            return new CreateRoomBookingResult.RoomNotAvailable();

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

        return new CreateRoomBookingResult.Error("roomBookings.API_ErrorCreateUnexpected");
    }

    public async Task<GetRoomBookingListResult> GetUpcomingRoomBookingsByEmployeeId(long employeeId)
    {
        try
        {
            var roomBookings = await _roomBookingRepo.GetUpcomingBookingsByEmployeeId(employeeId);
            return new GetRoomBookingListResult.Success(roomBookings);
        }
        catch (Exception)
        {
            return new GetRoomBookingListResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<GetRoomBookingListResult> GetRoomBookingsByDate(DateOnly date)
    {
        try
        {
            var roomBookings = await _roomBookingRepo.GetBookingsByDate(date);
            return new GetRoomBookingListResult.Success(roomBookings);
        }
        catch (Exception)
        {
            return new GetRoomBookingListResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<UpdateRoomBookingResult> UpdateRoomBooking(long id, CreateRoomBookingDto dto, long employeeId)
    {
        try
        {
            var rb = await _roomBookingRepo.GetById(id);
            if (rb is null)
                return new UpdateRoomBookingResult.NotFound("roomBookings.API_BookingErrorNotFoundById",
                    new Dictionary<string, string> { { "id", id.ToString() } });

            var roomModel = await _roomRepo.GetByName(dto.RoomName);
            if (roomModel is null)
                return new UpdateRoomBookingResult.Error("rooms.API_ErrorNotFoundByName",
                    new Dictionary<string, string> { { "name", dto.RoomName } });

            var hasConflict = await _roomBookingRepo.HasConflict(roomModel.Id, dto.BookingDate, dto.StartTime, dto.EndTime, rb.EventId);
            if (hasConflict)
                return new UpdateRoomBookingResult.Error("roomBookings.API_ErrorRoomAlreadyBooked");

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

            return new UpdateRoomBookingResult.Error("roomBookings.API_ErrorUpdateUnexpected");
        }
        catch (Exception)
        {
            return new UpdateRoomBookingResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<DeleteRoomBookingResult> DeleteRoomBooking(long id)
    {
        try
        {
            var rb = await _roomBookingRepo.GetById(id);
            if (rb is null)
                return new DeleteRoomBookingResult.NotFound(
                    "roomBookings.API_ErrorNotFoundById",
                    new Dictionary<string, string> { { "id", id.ToString() } });

            bool deleted = await _roomBookingRepo.Delete(rb);
            if (deleted)
                return new DeleteRoomBookingResult.Success();

            return new DeleteRoomBookingResult.Error("roomBookings.API_ErrorDeleteUnexpected");
        }
        catch (Exception)
        {
            return new DeleteRoomBookingResult.Error("general.API_ErrorUnexpected");
        }
    }
}
