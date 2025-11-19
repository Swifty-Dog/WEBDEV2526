using System.ComponentModel.DataAnnotations;

namespace OfficeCalendar.API.Models;

public class RoomModel
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string RoomName { get; set; } = string.Empty;

    [Required]
    public int Capacity { get; set; } = 0;

    [Required]
    [MaxLength(200)]
    public string Location { get; set; } = string.Empty;

    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<EventModel> Events { get; set; } = new HashSet<EventModel>();
    public virtual ICollection<RoomBookingModel> RoomBookings { get; set; } = new HashSet<RoomBookingModel>();
}
