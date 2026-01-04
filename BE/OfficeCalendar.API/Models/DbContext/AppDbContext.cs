using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Configuration;



namespace OfficeCalendar.API.Models.DbContext;

public class AppDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<EmployeeModel> Employees => Set<EmployeeModel>();
    public DbSet<AdminModel> Admins => Set<AdminModel>();
    public DbSet<GroupModel> Groups => Set<GroupModel>();
    public DbSet<GroupMembershipModel> GroupMemberships => Set<GroupMembershipModel>();
    public DbSet<GroupPermissionModel> GroupPermissions => Set<GroupPermissionModel>();
    public DbSet<RoomModel> Rooms => Set<RoomModel>();
    public DbSet<EventModel> Events => Set<EventModel>();
    public DbSet<EventParticipationModel> EventParticipations => Set<EventParticipationModel>();
    public DbSet<OfficeAttendanceModel> OfficeAttendances => Set<OfficeAttendanceModel>();
    public DbSet<RoomBookingModel> RoomBookings => Set<RoomBookingModel>();
    public DbSet<SettingsModel> Settings => Set<SettingsModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<GroupMembershipModel>()
            .HasKey(gMembership => new { gMembership.EmployeeId, gMembership.GroupId });

        modelBuilder.Entity<EventParticipationModel>()
            .HasKey(eParticipation => new { eParticipation.EventId, eParticipation.EmployeeId });

        modelBuilder.Entity<EventModel>()
            .HasOne(eventModel => eventModel.CreatedBy)
            .WithMany(employee => employee.CreatedEvents)
            .HasForeignKey(eventModel => eventModel.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<RoomBookingModel>()
            .HasOne(rBooking => rBooking.Room)
            .WithMany(room => room.RoomBookings)
            .HasForeignKey(rBooking => rBooking.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RoomBookingModel>()
            .HasOne(rb => rb.Event)
            .WithMany()
            .HasForeignKey(rb => rb.EventId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<SettingsModel>()
            .HasKey(s => s.EmployeeId);

        modelBuilder.Entity<SettingsModel>()
            .HasOne(s => s.Employee)
            .WithOne(e => e.Settings)
            .HasForeignKey<SettingsModel>(s => s.EmployeeId)
            .IsRequired();

        modelBuilder.Entity<RoomBookingModel>(builder =>
        {
            builder.Property(rBooking => rBooking.BookingDate)
                .HasConversion(
                    dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
                    dateTime => DateOnly.FromDateTime(dateTime));

            builder.Property(rBooking => rBooking.StartTime)
                .HasConversion<TimeOnlyToStringConverter>()
                .Metadata.SetValueComparer(new TimeOnlyComparer());

            builder.Property(rb => rb.EndTime)
                .HasConversion<TimeOnlyToStringConverter>()
                .Metadata.SetValueComparer(new TimeOnlyComparer());
        });
    }
}