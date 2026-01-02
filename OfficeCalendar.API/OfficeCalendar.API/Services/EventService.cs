using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Events;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using OfficeCalendar.API.Models;

namespace OfficeCalendar.API.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepo;
    private readonly IRoomBookingRepository _roomBookingRepo;

    public EventService(IEventRepository eventRepo, IRoomBookingRepository roomBookingRepo)
    {
        _eventRepo = eventRepo;
        _roomBookingRepo = roomBookingRepo;
    }

    private EventResponseDto MapEventToDto(EventModel eventModel, long? currentUserId)
    {
        return new EventResponseDto
        {
            Id = eventModel.Id,
            Title = eventModel.Title,
            Description = eventModel.Description,
            EventDate = DateOnly.FromDateTime(eventModel.EventDate),
            StartTime = eventModel.StartTime,
            EndTime = eventModel.EndTime,
            Room = eventModel.Room == null ? null : new RoomDto
            {
                Id = eventModel.Room.Id,
                RoomName = eventModel.Room.RoomName,
                Location = eventModel.Room.Location
            },

            Attendees = eventModel.EventParticipations
                .Select(ep => ep.Employee.FullName)
                .ToList(),

            Attending = currentUserId.HasValue &&
                        eventModel.EventParticipations.Any(ep => ep.EmployeeId == currentUserId.Value)
        };
    }

    public async Task<CreateEventResult> CreateEvent(long currentUserId, CreateEventDto dto)
    {
        try
        {
            var startIso = dto.StartTime;
            var endIso = dto.EndTime;
            var eventDate = startIso.Date;
            var startTime = new DateTime(1, 1, 1, startIso.Hour, startIso.Minute, 0);
            var endTime = new DateTime(1, 1, 1, endIso.Hour, endIso.Minute, 0);

            if (eventDate < DateTime.Today)
                return new CreateEventResult.Error("events.API_ErrorEventDatePast");

            if (startTime >= endTime)
                return new CreateEventResult.Error("events.API_ErrorEndBeforeStart");

            if (startTime.TimeOfDay < TimeSpan.FromHours(8) || endTime.TimeOfDay > TimeSpan.FromHours(18))
                return new CreateEventResult.Error("events.API_ErrorOutsideOfficeHours");

            if (await _roomBookingRepo.HasConflict(
                    dto.RoomId,
                    DateOnly.FromDateTime(eventDate),
                    TimeOnly.FromDateTime(startTime),
                    TimeOnly.FromDateTime(endTime)))
                return new CreateEventResult.Error("events.API_ErrorRoomAlreadyBooked");

            var newEvent = new EventModel
            {
                Title = dto.Title,
                Description = dto.Description,
                EventDate = eventDate,
                StartTime = startTime,
                EndTime = endTime,
                CreatedById = currentUserId,
                RoomId = dto.RoomId
            };

            var created = await _eventRepo.Create(newEvent);
            if (!created)
                return new CreateEventResult.Error("events.API_ErrorCreateFailed");

            var fullEvent = await _eventRepo.GetEventById(newEvent.Id);
            if (fullEvent == null)
                return new CreateEventResult.Error("events.API_ErrorNotFound");

            var dtoResult = MapEventToDto(fullEvent, currentUserId);

            var roomBooking = new RoomBookingModel
            {
                EventId = fullEvent.Id,
                RoomId = dto.RoomId,
                EmployeeId = currentUserId,
                BookingDate = DateOnly.FromDateTime(eventDate),
                StartTime = TimeOnly.FromDateTime(startTime),
                EndTime = TimeOnly.FromDateTime(endTime),
                Purpose = $"Event Booking: {dto.Title}"
            };

            await _roomBookingRepo.Create(roomBooking);

            return new CreateEventResult.Success(dtoResult);
        }
        catch (Exception)
        {
            return new CreateEventResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<GetEventResult> GetEventById(long eventId, long? currentUserId = null)
    {
        try
        {
            var eventModel = await _eventRepo.GetEventById(eventId);
            if (eventModel == null)
                return new GetEventResult.Error("events.API_ErrorNotFound");

            var dto = MapEventToDto(eventModel, currentUserId);
            return new GetEventResult.Success(dto);
        }
        catch (Exception)
        {
            return new GetEventResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<GetEventsResult> GetAllEvents(long? currentUserId = null)
    {
        try
        {
            var eventModels = await _eventRepo.GetAllEvents();
            var dtos = eventModels.Select(e => MapEventToDto(e, currentUserId)).ToList();
            return new GetEventsResult.Success(dtos);
        }
        catch (Exception)
        {
            return new GetEventsResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<UpdateEventResult> UpdateEvent(long eventId, UpdateEventDto dto, long? currentUserId = null)
    {
        try
        {
            var eventModel = await _eventRepo.GetById(eventId);
            if (eventModel == null)
                return new UpdateEventResult.NotFound("events.API_ErrorNotFound");

            var startIso = dto.StartTime;
            var endIso = dto.EndTime;
            var eventDate = startIso.Date;
            var startTime = new DateTime(1, 1, 1, startIso.Hour, startIso.Minute, 0);
            var endTime = new DateTime(1, 1, 1, endIso.Hour, endIso.Minute, 0);

            if (eventDate < DateTime.Today)
                return new UpdateEventResult.Error("events.API_ErrorEventDatePast");

            if (startTime >= endTime)
                return new UpdateEventResult.Error("events.API_ErrorEndBeforeStart");

            if (startTime.TimeOfDay < TimeSpan.FromHours(8) || endTime.TimeOfDay > TimeSpan.FromHours(18))
                return new UpdateEventResult.Error("events.API_ErrorOutsideOfficeHours");

            if (await _roomBookingRepo.HasConflict(
                    dto.RoomId,
                    DateOnly.FromDateTime(eventDate),
                    TimeOnly.FromDateTime(startTime),
                    TimeOnly.FromDateTime(endTime),
                    eventId))
                return new UpdateEventResult.Error("events.API_ErrorRoomAlreadyBooked");

            eventModel.Title = dto.Title;
            eventModel.Description = dto.Description;
            eventModel.EventDate = eventDate;
            eventModel.StartTime = startTime;
            eventModel.EndTime = endTime;
            eventModel.RoomId = dto.RoomId;

            var updated = await _eventRepo.Update(eventModel);
            if (!updated)
                return new UpdateEventResult.Error("events.API_ErrorUpdateFailed");

            var fullEvent = await _eventRepo.GetEventById(eventId);

            if (fullEvent == null)
                return new UpdateEventResult.Error("events.API_ErrorNotFound");

            var dtoResult = MapEventToDto(fullEvent, currentUserId);

            var roomBooking = await _roomBookingRepo.GetByEventId(fullEvent.Id);

            if (roomBooking is null)
                return new UpdateEventResult.Error("rooms.API_ErrorNotFound");

            roomBooking.RoomId = fullEvent.RoomId;
            roomBooking.StartTime = TimeOnly.FromDateTime(fullEvent.StartTime);
            roomBooking.EndTime = TimeOnly.FromDateTime(fullEvent.EndTime);

            await _roomBookingRepo.Update(roomBooking);

            return new UpdateEventResult.Success(dtoResult);
        }
        catch (Exception)
        {
            return new UpdateEventResult.Error("general.API_ErrorUnexpected");
        }
    }

    public async Task<DeleteEventResult> DeleteEvent(long eventId)
    {
        try
        {
            var eventModel = await _eventRepo.GetById(eventId);
            if (eventModel == null)
                return new DeleteEventResult.NotFound("events.API_ErrorNotFound");

            var roomBooking = await _roomBookingRepo.GetByEventId(eventModel.Id);
            if (roomBooking != null)
                await _roomBookingRepo.Delete(roomBooking);

            var deleted = await _eventRepo.Delete(eventModel);
            if (!deleted)
                return new DeleteEventResult.Error("events.API_ErrorDeleteFailed");

            return new DeleteEventResult.Success();
        }
        catch (Exception)
        {
            return new DeleteEventResult.Error("general.API_ErrorUnexpected");
        }
    }
}

