using OnlineCasinoBack.DTOS;

namespace OnlineCasinoBack.Models.Slot
{
    public interface ISlotEngine
    {
        string Key { get; }
        SpinResponseDto Spin(decimal betAmount);
    }
}
