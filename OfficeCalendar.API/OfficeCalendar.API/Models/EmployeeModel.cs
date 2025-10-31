using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace OfficeCalendar.API.Models;

public class EmployeeModel
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    public string FullName => $"{FirstName} {LastName}";

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = "Employee";

    [Required]
    [PasswordPropertyText]
    [MaxLength(100)]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


    public virtual AdminModel? Admin { get; set; }
    public virtual ICollection<EventModel> CreatedEvents { get; set; } = new HashSet<EventModel>();
    public virtual ICollection<RoomBookingModel> RoomBookings { get; set; } = new HashSet<RoomBookingModel>();
    public virtual ICollection<OfficeAttendanceModel> OfficeAttendances { get; set; } = new HashSet<OfficeAttendanceModel>();
    public virtual ICollection<GroupMembershipModel> GroupMemberships { get; set; } = new HashSet<GroupMembershipModel>();
    public virtual ICollection<EventParticipationModel> EventParticipations { get; set; } = new HashSet<EventParticipationModel>();
}
