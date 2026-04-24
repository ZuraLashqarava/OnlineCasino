using System.Text.Json;
using OnlineCasinoBack.Data;           
using OnlineCasinoBack.DTOS;
using OnlineCasinoBack.Models.Slot.Slot1;

namespace OnlineCasinoBack.Services
{
    public class SlotService
    {
        private readonly DataContext _context;
        private readonly Random _rng = new();

      
        private readonly List<(string Name, int CumulativeWeight)> _weightPool;
        private readonly int _totalWeight;

        public SlotService(DataContext context)
        {
            _context = context;

            
            _weightPool = new List<(string, int)>();
            int cumulative = 0;
            foreach (var sym in SlotSymbolDefinition.Symbols)
            {
                cumulative += sym.Weight;
                _weightPool.Add((sym.Name, cumulative));
            }
            _totalWeight = cumulative;
        }

        public async Task<SpinResponseDto> SpinAsync(int userId, decimal betAmount)
        {
           
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            if (user.Balance < betAmount)
                throw new InvalidOperationException("Insufficient balance.");

            
            user.Balance -= betAmount;

           
            var grid = GenerateGrid();

            
            var winLines = EvaluatePaylines(grid, betAmount);
            decimal totalWin = winLines.Sum(w => w.WinAmount);

          
            user.Balance += totalWin;

            
            var spin = new Spin
            {
                UserId = userId,
                BetAmount = betAmount,
                WinAmount = totalWin,
                ResultJson = JsonSerializer.Serialize(grid),
                CreatedAt = DateTime.UtcNow
            };
            _context.Spins.Add(spin);
            await _context.SaveChangesAsync();

            return new SpinResponseDto
            {
                Grid = grid,
                WinAmount = totalWin,
                NewBalance = user.Balance,
                IsWin = totalWin > 0,
                WinLines = winLines
            };
        }

        
        private string[][] GenerateGrid()
        {
            var grid = new string[5][];
            for (int reel = 0; reel < 5; reel++)
            {
                grid[reel] = new string[5];
                for (int row = 0; row < 5; row++)
                    grid[reel][row] = PickWeightedSymbol();
            }
            return grid;
        }

        
        private string PickWeightedSymbol()
        {
            int roll = _rng.Next(1, _totalWeight + 1);

            
            int lo = 0, hi = _weightPool.Count - 1;
            while (lo < hi)
            {
                int mid = (lo + hi) / 2;
                if (_weightPool[mid].CumulativeWeight < roll) lo = mid + 1;
                else hi = mid;
            }
            return _weightPool[lo].Name;
        }

       
        private List<WinLineDto> EvaluatePaylines(string[][] grid, decimal betAmount)
        {
            var results = new List<WinLineDto>();

            foreach (var payline in SlotPaylineConfig.Paylines)
            {
              
                var lineSymbols = new string[5];
                for (int reel = 0; reel < 5; reel++)
                    lineSymbols[reel] = grid[reel][payline.Positions[reel]];

                var win = EvaluateLine(lineSymbols, betAmount, payline.Id);
                if (win != null)
                    results.Add(win);
            }

            return results;
        }

        
        private WinLineDto? EvaluateLine(string[] symbols, decimal betAmount, int paylineId)
        {
           
            string baseSymbol = symbols.FirstOrDefault(s => s != "Wild") ?? "Wild";

            int matchCount = 0;
            foreach (var sym in symbols)
            {
                if (sym == baseSymbol || sym == "Wild")
                    matchCount++;
                else
                    break; 
            }

            if (matchCount < 3)
                return null;

            decimal multiplier = SlotSymbolDefinition.GetPayout(baseSymbol, matchCount);
            if (multiplier == 0)
                return null;

            decimal winAmount = betAmount * multiplier;
            return new WinLineDto
            {
                PaylineId = paylineId,
                Symbol = baseSymbol,
                MatchCount = matchCount,
                Multiplier = multiplier,
                WinAmount = winAmount,
                Positions = SlotPaylineConfig.Paylines
                    .First(p => p.Id == paylineId).Positions
            };
        }
    }
}