using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineCasinoBack.Data;
using OnlineCasinoBack.DTOS;
using OnlineCasinoBack.Service;
using OnlineCasinoBack.Services;
using System.Security.Claims;

namespace OnlineCasinoBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SlotController : ControllerBase
    {
        private readonly SlotService _slotService;
        private readonly SlotEngineRegistry _engineRegistry;
        private readonly DataContext _context;

        public SlotController(SlotService slotService, SlotEngineRegistry engineRegistry, DataContext context)
        {
            _slotService = slotService;
            _engineRegistry = engineRegistry;
            _context = context;
        }

        [HttpGet("list")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSlots()
        {
            var slots = await _context.Slots
                .Where(s => s.IsActive)
                .Select(s => new SlotDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    ImageUrl = s.ImageUrl,
                    IsNew = s.IsNew,
                    IsHot = s.IsHot,
                })
                .ToListAsync();

            return Ok(slots);
        }

        [HttpPost("spin")]
        [Authorize]
        public async Task<IActionResult> Spin([FromBody] SpinRequestDto request)
        {
            if (request.BetAmount <= 0)
                return BadRequest("Bet amount must be greater than 0.");

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Invalid token.");

            try
            {
                var result = await _slotService.SpinAsync(userId, request.BetAmount);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}