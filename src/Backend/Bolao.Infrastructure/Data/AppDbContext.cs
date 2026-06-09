using Bolao.Domain.Entities;
using Bolao.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Bolao.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Bolao.Domain.Entities.Bolao> Boloes => Set<Bolao.Domain.Entities.Bolao>();
    public DbSet<BolaoParticipant> BolaoParticipants => Set<BolaoParticipant>();
    public DbSet<Palpite> Palpites => Set<Palpite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Username).IsUnique();
            e.Property(x => x.Username).HasMaxLength(50);
            e.Property(x => x.Name).HasMaxLength(100);
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        modelBuilder.Entity<Bolao.Domain.Entities.Bolao>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasConversion<int>().HasDefaultValue(BolaoStatus.Aberto);
            e.HasOne(x => x.CreatedBy)
             .WithMany()
             .HasForeignKey(x => x.CreatedById)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        modelBuilder.Entity<BolaoParticipant>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.BolaoId, x.UserId }).IsUnique();
            e.HasOne(x => x.Bolao)
             .WithMany(x => x.Participants)
             .HasForeignKey(x => x.BolaoId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.User)
             .WithMany(x => x.Participations)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Palpite>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.BolaoId, x.UserId }).IsUnique();
            e.HasOne(x => x.Bolao)
             .WithMany(x => x.Palpites)
             .HasForeignKey(x => x.BolaoId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.User)
             .WithMany(x => x.Palpites)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Normalize all DateTime to UTC
        var utcConverter = new ValueConverter<DateTime, DateTime>(
            v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                    property.SetValueConverter(utcConverter);
            }
        }
    }
}
