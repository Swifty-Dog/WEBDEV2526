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


namespace OfficeCalendar.API.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepo;

    public EventService(IEventRepository eventRepo)
    {
        _eventRepo = eventRepo;
    }
    public async Task<CreateEventResult> CreateEvent(CreateEventDto newEventDto)
    {
        try
        {
            var newEvent = new EventModel
            {
                Title = newEventDto.Title,
                Description = newEventDto.Description,
                EventDate = newEventDto.EventDate,
                CreatedById = newEventDto.CreatedById,
                RoomId = newEventDto.RoomId

            };
            bool createdEvent = await _eventRepo.Create(newEvent);
            if (createdEvent)
            {
                return new CreateEventResult.Success(newEvent);
            }
            return new CreateEventResult.Error("There is a unexpected error");
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
            {
                return new GetEventResult.Error("Event is not found ");
            }

            return new GetEventResult.Success(eventModel);
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

            var eventDtos = eventModels.Select(e => new EventModel
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                EventDate = e.EventDate,
                CreatedById = e.CreatedById,
                RoomId = e.RoomId
            }).ToList();

            return new GetEventsResult.Success(eventDtos);
        }
        catch (Exception ex)
        {
            return new GetEventsResult.Error(ex.Message);
        }
    }

    public async Task<UpdateEventResult> UpdateEvent(UpdateEventDto updatedEventDto)
    {
        try
        {
            if (updatedEventDto.Id == 0)
            {
                return new UpdateEventResult.Error("Event ID is required");
            }
            var eventModel = await _eventRepo.GetById(updatedEventDto.Id);
            if (eventModel is null)
            {
                return new UpdateEventResult.NotFound("Event not found");
            }

            eventModel.Title = updatedEventDto.Title;
            eventModel.Description = updatedEventDto.Description;
            eventModel.EventDate = updatedEventDto.EventDate;
            eventModel.RoomId = updatedEventDto.RoomId;


            var updatedEvent = await _eventRepo.Update(eventModel);
            if (updatedEvent is false)
            {
                return new UpdateEventResult.Error("Cannot update event");
            }

            return new UpdateEventResult.Success(eventModel);
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
        throw new NotImplementedException();
    }
}
