namespace OnlineCasinoBack.DTOS
{
    public class WinLineDto
    {
        public int PaylineId { get; set; }
        public string Symbol { get; set; } = string.Empty;
        public int MatchCount { get; set; }
        public decimal Multiplier { get; set; }
        public decimal WinAmount { get; set; }
        public List<int> Positions { get; set; } = new(); 
    }
}
