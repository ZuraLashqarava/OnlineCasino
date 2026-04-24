using OnlineCasinoBack.DTOS;
using OnlineCasinoBack.Models.Slot;

namespace OnlineCasinoBack.Models.Slot.Slot1
{
    public class Slot1Engine : ISlotEngine
    {
        public string Key => "slot1";

        public SpinResponseDto Spin(decimal betAmount)
        {
            
            return new SpinResponseDto
            {
                Grid = new string[5][],
                WinAmount = 0,
                NewBalance = 0,
                IsWin = false,
                WinLines = new List<WinLineDto>()
            };
        }
    }
}
