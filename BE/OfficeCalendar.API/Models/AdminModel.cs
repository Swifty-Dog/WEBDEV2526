using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OfficeCalendar.API.Models;

public class AdminModel
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long EmployeeId { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public EmployeeModel? Employee { get; set; }

    [Required]
    [MaxLength(100)]
    public string Permissions { get; set; } = string.Empty;
}
