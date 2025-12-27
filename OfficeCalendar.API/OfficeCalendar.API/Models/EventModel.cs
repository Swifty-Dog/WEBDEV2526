using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OfficeCalendar.API.Models;

public class EventModel
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public DateTime EventDate { get; set; }

    [Required]
    public long CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))]
    public EmployeeModel? CreatedBy { get; set; }

    [Required]
    public long RoomId { get; set; }

    [ForeignKey(nameof(RoomId))]
    public RoomModel? Room { get; set; }

    public virtual ICollection<EventParticipationModel> EventParticipations { get; set; } = new HashSet<EventParticipationModel>();
}
