using BuildOps.API.Features.Authentication.Models;
using Microsoft.EntityFrameworkCore;

namespace BuildOps.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    #region DbSets
    public DbSet<User> Users { get; set; }

    public DbSet<UserProfile> UserProfiles { get; set; }

    public DbSet<UserCredential> UserCredentials { get; set; }

    public DbSet<RefreshToken> RefreshTokens { get; set; }
    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        #region User Entity
        modelBuilder.Entity<User>()
            .HasIndex(u => u.EmailId)
            .IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.PhoneNumber)
            .IsUnique();
        #endregion

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
