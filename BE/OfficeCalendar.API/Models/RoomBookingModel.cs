using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OfficeCalendar.API.Models;

public class RoomBookingModel
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long RoomId { get; set; }

    [ForeignKey(nameof(RoomId))]
    public RoomModel Room { get; set; } = null!;

    [Required]
    public long EmployeeId { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public EmployeeModel Employee { get; set; } = null!;
    public long? EventId { get; set; }
    [ForeignKey(nameof(EventId))]
    public EventModel? Event { get; set; }

    [Required]
    public DateOnly BookingDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    [Required]
    public TimeOnly StartTime { get; set; } = TimeOnly.ParseExact("09:00", "HH:mm");

    [Required]
    public TimeOnly EndTime { get; set; } = TimeOnly.ParseExact("10:00", "HH:mm");

    [Required]
    [MaxLength(500)]
    public string Purpose { get; set; } = string.Empty;
}
