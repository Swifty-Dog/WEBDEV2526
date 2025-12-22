using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OfficeCalendar.API.Models;

public class GroupMembershipModel
{
    public long EmployeeId { get; set; }
    public long GroupId { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public EmployeeModel? Employee { get; set; }

    [ForeignKey(nameof(GroupId))]
    public GroupModel? Group { get; set; }
}
