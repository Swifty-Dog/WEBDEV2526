using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OfficeCalendar.API.Models;

public class EventParticipationModel
{
    [Required]
    public long EventId { get; set; }

    [ForeignKey(nameof(EventId))]
    public EventModel Event { get; set; } = null!;

    [Required]
    public long EmployeeId { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public EmployeeModel Employee { get; set; } = null!;
}
