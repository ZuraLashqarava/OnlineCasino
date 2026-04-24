namespace OnlineCasinoBack.DTOS
{
    public class SpinRequestDto
    {
        public decimal BetAmount { get; set; }
        public string SlotKey { get; set; } = "slot1";
    }
}
