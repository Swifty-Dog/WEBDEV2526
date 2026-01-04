using OfficeCalendar.API.DTOs.Rooms.Request;
using OfficeCalendar.API.DTOs.Rooms.Response;
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

            return new GetRoomResult.NotFound("rooms.API_ErrorNotFoundById",
                new Dictionary<string, string> { { "id", id.ToString() } });
        }
        catch (Exception)
        {
            return new GetRoomResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<CreateRoomResult> CreateRoom(CreateRoomDto dto)
    {
        try
        {
            var existingRoom = await GetRoomByName(dto.RoomName);
            if (existingRoom is GetRoomResult.Success)
                return new CreateRoomResult.DuplicateRoom("rooms.API_ErrorDuplicateName",
                    new Dictionary<string, string> { { "name", dto.RoomName } });

            var newRoom = new RoomModel
            {
                RoomName = dto.RoomName,
                Capacity = dto.Capacity,
                Location = dto.Location
            };

            bool created = await _roomRepo.Create(newRoom);
            if (created)
                return new CreateRoomResult.Success(newRoom);

            return new CreateRoomResult.Error("rooms.API_ErrorCreateUnexpected");
        }
        catch (Exception)
        {
            return new CreateRoomResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<GetRoomResult> GetRoomByName(string roomName)
    {
        try
        {
            RoomModel? room = await _roomRepo.GetByName(roomName);
            if (room != null)
                return new GetRoomResult.Success(room);

            return new GetRoomResult.NotFound("rooms.API_ErrorNotFoundByName",
                new Dictionary<string, string> { { "name", roomName } });
        }
        catch (Exception)
        {
            return new GetRoomResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<GetRoomsListResult> GetAllRooms()
    {
        try
        {
            var roomModels = await _roomRepo.GetAll();
            List<RoomNameDto> rooms = [];
            rooms.AddRange(roomModels.Select(room => new RoomNameDto
            {
                Id = room.Id,
                RoomName = room.RoomName,
                Capacity = room.Capacity,
                Location = room.Location
            }));

            return new GetRoomsListResult.Success(rooms);
        }
        catch (Exception)
        {
            return new GetRoomsListResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<UpdateRoomResult> UpdateRoom(UpdateRoomDto dto)
    {
        try
        {
            var roomResult = await GetRoomById(dto.Id);
            if (roomResult is not GetRoomResult.Success roomSuccess)
                return new UpdateRoomResult.RoomNotFound();

            var roomToUpdate = roomSuccess.Room;

            if (roomToUpdate.RoomName != dto.RoomName)
            {
                var existingRoomResult = await GetRoomByName(dto.RoomName);
                if (existingRoomResult is GetRoomResult.Success existingRoomSuccess && existingRoomSuccess.Room.Id != roomToUpdate.Id)
                    return new UpdateRoomResult.InvalidData("rooms.API_ErrorDuplicateName",
                        new Dictionary<string, string> { { "name", dto.RoomName } });

                roomToUpdate.RoomName = dto.RoomName;
            }

            if (roomToUpdate.Capacity != dto.Capacity)
                roomToUpdate.Capacity = dto.Capacity;
            if (roomToUpdate.Location != dto.Location)
                roomToUpdate.Location = dto.Location;

            bool updated = await _roomRepo.Update(roomToUpdate);
            if (updated)
                return new UpdateRoomResult.Success(roomToUpdate);

            return new UpdateRoomResult.Error("rooms.API_ErrorUpdateUnexpected");
        }
        catch (Exception)
        {
            return new UpdateRoomResult.Error("general.API_ErrorUnexpected");
        }
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

            return new DeleteRoomResult.Error("rooms.API_ErrorDeleteUnexpected");
        }
        catch (Exception)
        {
            return new DeleteRoomResult.Error("general.API_ErrorUnexpected");
        }
    }
}