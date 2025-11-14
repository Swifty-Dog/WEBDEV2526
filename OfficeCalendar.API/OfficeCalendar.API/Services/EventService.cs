using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using OfficeCalendar.API.DTOs.Events.Response;
using OfficeCalendar.API.DTOs.Events.Request;
using OfficeCalendar.API.Services.Interfaces;
using OfficeCalendar.API.Services.Results.Events;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;


namespace OfficeCalendar.API.Services;

public class EventService : IEventService
{
    public async Task<CreateEventResult> CreateEvent(CreateEventDto newEventDto)
    {

        throw new NotImplementedException();
    }

    public async Task<GetEventResult> GetEventById(long eventId)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<GetEventResult>> GetAllEvents()
    {
        throw new NotImplementedException();
    }

    public async Task<UpdateEventResult> UpdateEvent(UpdateEventDto updatedEventDto)
    {
        throw new NotImplementedException();
    }

    public async Task<DeleteEventResult> DeleteEvent(long eventId)
    {
        throw new NotImplementedException();
    }
}
