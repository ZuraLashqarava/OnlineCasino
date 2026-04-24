namespace OnlineCasinoBack.Models.Slot.Slot1
{
    public class Spin
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal BetAmount { get; set; }
        public decimal WinAmount { get; set; }
        public string ResultJson { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!; 
    }
}
