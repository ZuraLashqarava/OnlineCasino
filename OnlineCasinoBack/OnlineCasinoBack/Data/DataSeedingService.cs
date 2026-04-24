using Microsoft.EntityFrameworkCore;
using OnlineCasinoBack.Abstractions;
using OnlineCasinoBack.Data;
using OnlineCasinoBack.Models;
using OnlineCasinoBack.Security;

namespace OnlineCasinoBack.Data
{
    public class DatabaseSeedingService
    {
        private readonly DataContext _context;
        private readonly ILogger<DatabaseSeedingService> _logger;

        public DatabaseSeedingService(DataContext context, ILogger<DatabaseSeedingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            if (!await _context.Users.AnyAsync())
            {
                PasswordSecurity.CreatePasswordHash("Admin123!", out byte[] hash, out byte[] salt);
                var admin = new User
                {
                    FullName = "Admin User",
                    Email = "admin@casino.com",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    Role = "Admin",
                    Balance = 10000,
                    PersonalNumber = "00000000000",
                    IsConfirmed = true,
                    ConfirmationToken = null
                };
                await _context.Users.AddAsync(admin);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Users seeded successfully");
            }

            if (!await _context.Slots.AnyAsync())
            {
                var slots = SlotAbstraction.GetSlots();
                await _context.Slots.AddRangeAsync(slots);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Slots seeded successfully");
            }
        }
    }
}