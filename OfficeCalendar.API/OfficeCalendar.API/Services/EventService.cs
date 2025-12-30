using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Events;
using OfficeCalendar.API.Models.Repositories.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using OfficeCalendar.API.Models;
using SQLitePCL;
using Microsoft.EntityFrameworkCore;


namespace OfficeCalendar.API.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepo;

    public EventService(IEventRepository eventRepo)
    {
        _eventRepo = eventRepo;
    }

    private async Task<bool> HasRoomConflict(
        long roomId,
        DateTime eventDate,
        DateTime startTime,
        DateTime endTime,
        long? ignoreEventId = null)
    {
        var startDateTime = eventDate.Date + startTime.TimeOfDay;
        var endDateTime = eventDate.Date + endTime.TimeOfDay;

        var eventsInRoom = await _eventRepo.GetEventsByRoomAndDate(roomId, eventDate);

        return eventsInRoom.Any(e =>
        {
            if (ignoreEventId.HasValue && e.Id == ignoreEventId.Value)
                return false;

            var existingStart = e.EventDate.Date + e.StartTime.TimeOfDay;
            var existingEnd = e.EventDate.Date + e.EndTime.TimeOfDay;

            return startDateTime < existingEnd && endDateTime > existingStart;
        });
    }

    private EventResponseDto MapEventToDto(EventModel eventModel)
    {
        // Combineer eventDate + StartTime/EndTime voor ISO strings
        var startIso = eventModel.EventDate.Date + eventModel.StartTime.TimeOfDay;
        var endIso = eventModel.EventDate.Date + eventModel.EndTime.TimeOfDay;

        return new EventResponseDto
        {
            Id = eventModel.Id,
            Title = eventModel.Title,
            Description = eventModel.Description,
            EventDate = eventModel.EventDate, // frontend ziet alleen datum
            StartTime = eventModel.StartTime, // frontend ziet alleen tijd
            EndTime = eventModel.EndTime,
            Room = eventModel.Room == null ? null : new RoomDto
            {
                Id = eventModel.Room.Id,
                RoomName = eventModel.Room.RoomName,
                Location = eventModel.Room.Location
            },
            AttendeesCount = eventModel.EventParticipations?.Count ?? 0
        };
    }
    public async Task<CreateEventResult> CreateEvent(long currentUserId, CreateEventDto dto)
    {
        try
        {
            // Parse de ISO strings als lokale tijd
            var startIso = dto.StartTime.ToLocalTime();
            var endIso = dto.EndTime.ToLocalTime();

            // Split datum en tijd
            var eventDate = startIso.Date;
            var startTime = new DateTime(1, 1, 1, startIso.Hour, startIso.Minute, 0);
            var endTime = new DateTime(1, 1, 1, endIso.Hour, endIso.Minute, 0);

            // Validatie
            if (eventDate < DateTime.Today)
                return new CreateEventResult.Error("Event date cannot be in the past");

            if (startTime >= endTime)
                return new CreateEventResult.Error("End time must be later than start time");

            if (startTime.TimeOfDay < TimeSpan.FromHours(8) || endTime.TimeOfDay > TimeSpan.FromHours(18))
                return new CreateEventResult.Error("Event must be within office hours (08:00–18:00)");

            // Check op room conflicts
            if (await HasRoomConflict(dto.RoomId, eventDate, startTime, endTime))
                return new CreateEventResult.Error("Room is already booked for this time slot");

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
            return created
                ? new CreateEventResult.Success(newEvent)
                : new CreateEventResult.Error("Could not create event");
        }
        catch (Exception ex)
        {
            return new CreateEventResult.Error(ex.Message);
        }
    }



    public async Task<GetEventResult> GetEventById(long eventId)
    {
        try
        {
            var eventModel = await _eventRepo.GetById(eventId);
            if (eventModel is null)
                return new GetEventResult.Error("Event is not found");

            var dto = MapEventToDto(eventModel);
            return new GetEventResult.Success(dto);
        }
        catch (Exception ex)
        {
            return new GetEventResult.Error(ex.Message);
        }
    }

    public async Task<GetEventsResult> GetAllEvents()
    {
        try
        {
            var eventModels = await _eventRepo.GetAllEvents();
            var eventDtos = eventModels.Select(MapEventToDto).ToList();
            return new GetEventsResult.Success(eventDtos);
        }
        catch (Exception ex)
        {
            return new GetEventsResult.Error(ex.Message);
        }
    }


    public async Task<UpdateEventResult> UpdateEvent(long eventId, UpdateEventDto dto)
    {
        try
        {
            var eventModel = await _eventRepo.GetById(eventId);
            if (eventModel is null)
                return new UpdateEventResult.NotFound("Event not found");

            var startIso = dto.StartTime.ToLocalTime();
            var endIso = dto.EndTime.ToLocalTime();

            var eventDate = startIso.Date;
            var startTime = new DateTime(1, 1, 1, startIso.Hour, startIso.Minute, 0);
            var endTime = new DateTime(1, 1, 1, endIso.Hour, endIso.Minute, 0);

            if (eventDate < DateTime.Today)
                return new UpdateEventResult.Error("Event date cannot be in the past");

            if (startTime >= endTime)
                return new UpdateEventResult.Error("End time must be later than start time");

            if (startTime.TimeOfDay < TimeSpan.FromHours(8) || endTime.TimeOfDay > TimeSpan.FromHours(18))
                return new UpdateEventResult.Error("Event must be within office hours (08:00–18:00)");

            if (await HasRoomConflict(dto.RoomId, eventDate, startTime, endTime, eventId))
                return new UpdateEventResult.Error("Room is already booked for this time slot");

            eventModel.Title = dto.Title;
            eventModel.Description = dto.Description;
            eventModel.EventDate = eventDate;
            eventModel.StartTime = startTime;
            eventModel.EndTime = endTime;
            eventModel.RoomId = dto.RoomId;

            var updated = await _eventRepo.Update(eventModel);
            return updated
                ? new UpdateEventResult.Success(eventModel)
                : new UpdateEventResult.Error("Cannot update event");
        }
        catch (Exception ex)
        {
            return new UpdateEventResult.Error(ex.Message);
        }
    }



    public async Task<DeleteEventResult> DeleteEvent(long eventId)
    {
        try
        {
            var eventModel = await _eventRepo.GetById(eventId);
            if (eventModel is null)
            {
                return new DeleteEventResult.NotFound("Event not found");
            }

            var deleted = await _eventRepo.Delete(eventModel);
            if (!deleted)
                return new DeleteEventResult.Error("Cannot delete event");


            return new DeleteEventResult.Success();
        }
        catch (Exception ex)
        {
            return new DeleteEventResult.Error(ex.Message);
        }
    }
}
