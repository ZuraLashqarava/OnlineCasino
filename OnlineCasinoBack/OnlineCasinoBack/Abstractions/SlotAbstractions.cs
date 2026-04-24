using OnlineCasinoBack.Models.Slot;

namespace OnlineCasinoBack.Abstractions
{
    public static class SlotAbstraction
    {
        public static List<Slot> GetSlots()
        {
            return new List<Slot>
            {
                new Slot
                {
                    Name        = "Fruit Frenzy",
                    Description = "5×5 reels · 20 paylines · Wild substitutes",
                    ImageUrl    = "/assets/slots/fruit-frenzy.png",
                    IsHot       = true,
                    IsNew       = false,
                    IsActive    = true,
                },
                new Slot
                {
                    Name        = "Lucky Sevens",
                    Description = "Classic symbols · Massive Lucky 7 jackpots",
                    ImageUrl    = "/assets/slots/lucky-sevens.png",
                    IsNew       = true,
                    IsHot       = false,
                    IsActive    = true,
                },
                new Slot
                {
                    Name        = "Golden Reels",
                    Description = "High volatility · 50× max payout",
                    ImageUrl    = "/assets/slots/golden-reels.png",
                    IsNew       = false,
                    IsHot       = false,
                    IsActive    = true,
                },
                new Slot
                {
                    Name        = "Berry Blast",
                    Description = "Strawberry & Watermelon specials · Free spins",
                    ImageUrl    = "/assets/slots/berry-blast.png",
                    IsNew       = true,
                    IsHot       = false,
                    IsActive    = true,
                },
                new Slot
                {
                    Name        = "Wild Storm",
                    Description = "Wild-heavy board · Cascading multipliers",
                    ImageUrl    = "/assets/slots/wild-storm.png",
                    IsNew       = false,
                    IsHot       = false,
                    IsActive    = true,
                },
                new Slot
                {
                    Name        = "Plum Palace",
                    Description = "Low-stake friendly · Steady payline hits",
                    ImageUrl    = "/assets/slots/plum-palace.png",
                    IsHot       = true,
                    IsNew       = false,
                    IsActive    = true,
                },
            };
        }
    }
}
