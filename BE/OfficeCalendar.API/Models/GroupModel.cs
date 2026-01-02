using System.ComponentModel.DataAnnotations;

namespace OfficeCalendar.API.Models;

public class GroupModel
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string GroupName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public virtual ICollection<GroupPermissionModel> GroupPermissions { get; set; } = new HashSet<GroupPermissionModel>();
    public virtual ICollection<GroupMembershipModel> GroupMemberships { get; set; } = new HashSet<GroupMembershipModel>();
}
