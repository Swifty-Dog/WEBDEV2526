using OfficeCalendar.API.DTOs.Rooms.Request;
using OfficeCalendar.API.Models;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Rooms;

namespace OfficeCalendar.API.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepo;

    public RoomService(IRoomRepository roomRepo)
    {
        _roomRepo = roomRepo;
    }

    public async Task<GetRoomResult> GetRoomById(long id)
    {
        try
        {
            var room = await _roomRepo.GetById(id);
            if (room != null)
                return new GetRoomResult.Success(room);

            return new GetRoomResult.NotFound($"Kamer met ID {id} niet gevonden.");
        }
        catch (Exception ex)
        { return new GetRoomResult.Error($"Er is een fout opgetreden tijdens het ophalen van de kamer: {ex.Message}"); }
    }

    public async Task<CreateRoomResult> CreateRoom(CreateRoomRequest request)
    {
        try
        {
            var existingRoom = await GetRoomByName(request.RoomName);
            if (existingRoom is GetRoomResult.Success)
                return new CreateRoomResult.DuplicateRoom($"Kamer met de naam {request.RoomName} bestaat al.");

            var newRoom = new RoomModel
            {
                RoomName = request.RoomName,
                Capacity = request.Capacity,
                Location = request.Location
            };

            bool created = await _roomRepo.Create(newRoom);
            if (created)
                return new CreateRoomResult.Success(newRoom);

            return new CreateRoomResult.Error("Kamer kon niet worden aangemaakt door een onbekende fout.");
        }
        catch (Exception ex)
        {
            return new CreateRoomResult.Error($"Er is een fout opgetreden tijdens het aanmaken van de kamer: {ex.Message}");
        }
    }

    public async Task<GetRoomResult> GetRoomByName(string roomName)
    {
        try
        {
            RoomModel? room = await _roomRepo.GetByName(roomName);
            if (room != null)
                return new GetRoomResult.Success(room);
            return new GetRoomResult.NotFound($"Kamer met naam {roomName} niet gevonden.");
        }
        catch (Exception ex)
        { return new GetRoomResult.Error($"Er is een fout opgetreden tijdens het ophalen van de kamers: {ex.Message}"); }
    }

    public async Task<GetRoomsListResult> GetAllRooms()
    {
        try
        {
            var rooms = await _roomRepo.GetAll();
            return new GetRoomsListResult.Success(rooms.ToList());
        }
        catch (Exception ex)
        { return new GetRoomsListResult.Error($"Er is een fout opgetreden tijdens het ophalen van de kamers: {ex.Message}"); }
    }

    public async Task<UpdateRoomResult> UpdateRoom(UpdateRoomRequest request)
    {
        try
        {
            var roomResult = await GetRoomById(request.Id);
            if (roomResult is not GetRoomResult.Success roomSuccess)
                return new UpdateRoomResult.RoomNotFound();

            var roomToUpdate = roomSuccess.Room;

            if (roomToUpdate.RoomName != request.RoomName)
            {
                var existingRoomResult = await GetRoomByName(request.RoomName);
                if (existingRoomResult is GetRoomResult.Success existingRoomSuccess && existingRoomSuccess.Room.Id != roomToUpdate.Id)
                    return new UpdateRoomResult.InvalidData($"Kamer met de naam {request.RoomName} bestaat al.");

                roomToUpdate.RoomName = request.RoomName;
            }

            if (roomToUpdate.Capacity != request.Capacity)
                roomToUpdate.Capacity = request.Capacity;
            if (roomToUpdate.Location != request.Location)
                roomToUpdate.Location = request.Location;

            bool updated = await _roomRepo.Update(roomToUpdate);
            if (updated)
                return new UpdateRoomResult.Success(roomToUpdate);

            return new UpdateRoomResult.Error("Kamer kon niet worden bijgewerkt door een onbekende fout.");
        }
        catch (Exception ex)
        { return new UpdateRoomResult.Error($"Er is een fout opgetreden tijdens het bijwerken van de kamer: {ex.Message}"); }
    }

    public async Task<DeleteRoomResult> DeleteRoom(long id)
    {
        try
        {
            var roomResult = await GetRoomById(id);
            if (roomResult is not GetRoomResult.Success roomSuccess)
                return new DeleteRoomResult.RoomNotFound();

            bool deleted = await _roomRepo.Delete(roomSuccess.Room);
            if (deleted)
                return new DeleteRoomResult.Success();

            return new DeleteRoomResult.Error("Kamer kon niet worden verwijderd door een onbekende fout.");
        }
        catch (Exception ex)
        { return new DeleteRoomResult.Error($"Er is een fout opgetreden tijdens het verwijderen van de kamer: {ex.Message}"); }
    }
}
