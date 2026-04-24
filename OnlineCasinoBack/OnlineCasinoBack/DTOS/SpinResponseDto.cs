namespace OnlineCasinoBack.DTOS
{
    public class SpinResponseDto
    {
        public string[][] Grid { get; set; } = new string[5][];
        public decimal WinAmount { get; set; }
        public decimal NewBalance { get; set; }
        public bool IsWin { get; set; }
        public List<WinLineDto> WinLines { get; set; } = new();
    }
}
