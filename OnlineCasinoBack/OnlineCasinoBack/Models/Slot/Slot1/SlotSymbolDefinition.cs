namespace OnlineCasinoBack.Models.Slot.Slot1
{
    public static class SlotSymbolDefinition
    {
        // ── Payout multipliers keyed by (symbolName, matchCount) ──────────────
        // Applied to bet amount. E.g. 3x Cherry pays 0.5 × bet.
        private static readonly Dictionary<string, Dictionary<int, decimal>> PayoutTable = new()
        {
            ["Cherry"] = new() { [3] = 0.5m, [4] = 1.0m, [5] = 2.0m },
            ["Lemon"] = new() { [3] = 0.5m, [4] = 1.0m, [5] = 2.0m },
            ["Orange"] = new() { [3] = 0.75m, [4] = 1.5m, [5] = 3.0m },
            ["Plum"] = new() { [3] = 0.75m, [4] = 1.5m, [5] = 3.0m },
            ["Watermelon"] = new() { [3] = 2.0m, [4] = 5.0m, [5] = 10.0m },
            ["Strawberry"] = new() { [3] = 3.0m, [4] = 8.0m, [5] = 15.0m },
            ["Lucky7"] = new() { [3] = 5.0m, [4] = 15.0m, [5] = 30.0m },
            ["Wild"] = new() { [3] = 10.0m, [4] = 25.0m, [5] = 50.0m },
        };

        // ── Symbol pool (weight = relative frequency on the reel) ─────────────
        // Higher weight → appears more often. Boosted for demo win-rate.
        public static readonly List<SlotSymbol> Symbols = new()
        {
            // Low-value — very common
            new SlotSymbol { Name = "Cherry",     Weight = 30 },
            new SlotSymbol { Name = "Lemon",      Weight = 28 },
            new SlotSymbol { Name = "Orange",     Weight = 26 },
            new SlotSymbol { Name = "Plum",       Weight = 24 },
            // High-value — less common
            new SlotSymbol { Name = "Watermelon", Weight = 15 },
            new SlotSymbol { Name = "Strawberry", Weight = 12 },
            new SlotSymbol { Name = "Lucky7",     Weight = 8  },
            // Wild — rare but substitutes for all symbols
            new SlotSymbol { Name = "Wild",       Weight = 6  },
        };

        public static decimal GetPayout(string symbol, int matchCount)
        {
            if (PayoutTable.TryGetValue(symbol, out var table) &&
                table.TryGetValue(matchCount, out var multiplier))
                return multiplier;

            return 0m;
        }
    }
}
