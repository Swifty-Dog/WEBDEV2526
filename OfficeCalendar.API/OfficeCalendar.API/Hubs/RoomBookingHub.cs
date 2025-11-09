using Microsoft.AspNetCore.SignalR;

namespace OfficeCalendar.API.Hubs
{
    public class RoomBookingHub : Hub
    {
        public async Task NotifyBookingChanged(string employeeId)
        {
            await Clients.User(employeeId).SendAsync("BookingChanged");
        }

        public async Task BroadcastBookingChanged()
        {
            await Clients.All.SendAsync("BookingChanged");
        }
    }
}