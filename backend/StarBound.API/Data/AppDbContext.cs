using Microsoft.EntityFrameworkCore;
using StarBound.API.Models;

namespace StarBound.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Star> Stars => Set<Star>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.GoogleId).IsUnique().HasFilter("GoogleId IS NOT NULL");
        });

        // Star
        modelBuilder.Entity<Star>(entity =>
        {
            entity.HasIndex(s => s.StarCatalogId).IsUnique();
            entity.HasOne(s => s.Owner)
                  .WithMany(u => u.OwnedStars)
                  .HasForeignKey(s => s.OwnerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
