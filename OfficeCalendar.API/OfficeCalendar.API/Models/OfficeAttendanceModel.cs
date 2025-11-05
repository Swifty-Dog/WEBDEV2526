using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OfficeCalendar.API.Models;

public class OfficeAttendanceModel
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long EmployeeId { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public EmployeeModel Employee { get; set; } = null!;

    [Required]
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;
}
