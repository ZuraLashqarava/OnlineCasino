namespace OnlineCasinoBack.DTOS
{
    public class SlotDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsNew { get; set; }
        public bool IsHot { get; set; }
    }
}
