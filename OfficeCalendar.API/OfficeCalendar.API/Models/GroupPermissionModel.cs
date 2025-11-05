using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OfficeCalendar.API.Models;

public class GroupPermissionModel
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long GroupId { get; set; }

    [ForeignKey(nameof(GroupId))]
    public GroupModel Group { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string ResourceType { get; set; } = string.Empty;

    [Required]
    public long ResourceId { get; set; }

    [Required]
    public bool CanRead { get; set; }

    [Required]
    public bool CanUpdate { get; set; }
}
