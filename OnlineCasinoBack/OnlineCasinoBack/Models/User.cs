using System.ComponentModel.DataAnnotations;

namespace OnlineCasinoBack.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string FullName { get; set; }

        [Required]
        [MaxLength(100)]
        public string Email { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }

        [Required]
        public byte[] PasswordSalt { get; set; }

        public string PersonalNumber { get; set; }

        public decimal Balance { get; set; } = 0m;

        public int FailedLoginAttempts { get; set; } = 0;

        public DateTime? LockoutEnd { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLogin { get; set; }

        public string Role { get; set; } = "User";

        public bool IsConfirmed { get; set; } = false;

        public string? ConfirmationToken { get; set; }
    }
}