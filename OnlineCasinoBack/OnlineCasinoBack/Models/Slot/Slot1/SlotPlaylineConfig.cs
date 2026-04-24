namespace OnlineCasinoBack.Models.Slot.Slot1
{
    public static class SlotPaylineConfig
    {
        public static readonly List<Payline> Paylines = new()
        {
            // ── 5 Horizontal rows ───────────────────────────────────────────
            new Payline { Id = 0,  Positions = new List<int> { 0, 0, 0, 0, 0 } }, // Top row
            new Payline { Id = 1,  Positions = new List<int> { 1, 1, 1, 1, 1 } }, // Row 2
            new Payline { Id = 2,  Positions = new List<int> { 2, 2, 2, 2, 2 } }, // Middle row
            new Payline { Id = 3,  Positions = new List<int> { 3, 3, 3, 3, 3 } }, // Row 4
            new Payline { Id = 4,  Positions = new List<int> { 4, 4, 4, 4, 4 } }, // Bottom row
 
            // ── Diagonals ───────────────────────────────────────────────────
            new Payline { Id = 5,  Positions = new List<int> { 0, 1, 2, 3, 4 } }, // Diagonal ↘
            new Payline { Id = 6,  Positions = new List<int> { 4, 3, 2, 1, 0 } }, // Diagonal ↗
            new Payline { Id = 7,  Positions = new List<int> { 1, 2, 3, 4, 3 } }, // Diagonal ↘ offset
            new Payline { Id = 8,  Positions = new List<int> { 3, 2, 1, 0, 1 } }, // Diagonal ↗ offset
 
            // ── V-shapes ────────────────────────────────────────────────────
            new Payline { Id = 9,  Positions = new List<int> { 0, 1, 2, 1, 0 } }, // Inverted V (top)
            new Payline { Id = 10, Positions = new List<int> { 4, 3, 2, 3, 4 } }, // V (bottom)
            new Payline { Id = 11, Positions = new List<int> { 2, 1, 0, 1, 2 } }, // V (middle-top)
            new Payline { Id = 12, Positions = new List<int> { 2, 3, 4, 3, 2 } }, // V (middle-bottom)
 
            // ── Zigzags ─────────────────────────────────────────────────────
            new Payline { Id = 13, Positions = new List<int> { 0, 1, 0, 1, 0 } }, // Zigzag top
            new Payline { Id = 14, Positions = new List<int> { 4, 3, 4, 3, 4 } }, // Zigzag bottom
            new Payline { Id = 15, Positions = new List<int> { 1, 2, 1, 2, 1 } }, // Zigzag mid-top
            new Payline { Id = 16, Positions = new List<int> { 3, 2, 3, 2, 3 } }, // Zigzag mid-bottom
 
            // ── Flat with dip/rise ──────────────────────────────────────────
            new Payline { Id = 17, Positions = new List<int> { 0, 0, 1, 0, 0 } }, // Top dip
            new Payline { Id = 18, Positions = new List<int> { 4, 4, 3, 4, 4 } }, // Bottom dip
            new Payline { Id = 19, Positions = new List<int> { 2, 2, 3, 2, 2 } }, // Middle dip
        };
    }
}
