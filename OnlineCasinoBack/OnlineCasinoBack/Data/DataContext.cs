using Microsoft.EntityFrameworkCore;
using OnlineCasinoBack.Models;
using OnlineCasinoBack.Models.Slot;
using OnlineCasinoBack.Models.Slot.Slot1;

namespace OnlineCasinoBack.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Spin> Spins { get; set; }
        public DbSet<Slot> Slots { get; set; } 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Balance)
                .HasColumnType("decimal(18,2)");
        }
    }
}