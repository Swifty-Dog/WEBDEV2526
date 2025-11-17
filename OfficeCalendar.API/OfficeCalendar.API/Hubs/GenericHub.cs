using Microsoft.AspNetCore.SignalR;

namespace OfficeCalendar.API.Hubs;

public class GenericHub : Hub
{
    public async Task Broadcast(string eventName, object? payload = null)
    {
        await Clients.All.SendAsync(eventName, payload);
    }
}
