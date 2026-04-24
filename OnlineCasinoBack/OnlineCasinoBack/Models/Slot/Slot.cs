namespace OnlineCasinoBack.Models.Slot
{
    public class Slot
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsNew { get; set; }
        public bool IsHot { get; set; }
        public bool IsActive { get; set; } = true;
        public string EngineKey { get; set; } = string.Empty;
    }
}
