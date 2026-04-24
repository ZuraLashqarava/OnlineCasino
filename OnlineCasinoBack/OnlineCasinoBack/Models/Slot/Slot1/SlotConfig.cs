namespace OnlineCasinoBack.Models.Slot.Slot1
{
    public class SlotConfig
    {
        public int Id { get; set; }
        public string Name { get; set; }       
        public string ImageUrl { get; set; }  
        public string Description { get; set; }
        public int Reels { get; set; } = 5;
        public int Rows { get; set; } = 5;

        
        public string SymbolsJson { get; set; }
        public string PaylinesJson { get; set; }
    }
}
