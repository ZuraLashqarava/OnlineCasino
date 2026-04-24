using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineCasinoBack.Data;
using OnlineCasinoBack.DTOS;
using OnlineCasinoBack.Models;
using OnlineCasinoBack.Security;

namespace OnlineCasinoBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly EmailSender _emailSender;
        private readonly IConfiguration _configuration;

        public AuthController(DataContext context, EmailSender emailSender, IConfiguration configuration)
        {
            _context = context;
            _emailSender = emailSender;
            _configuration = configuration;
        }

        
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!Regex.IsMatch(dto.PersonalNumber ?? "", @"^\d{11}$"))
                return BadRequest(new { message = "Personal number must be exactly 11 digits." });

            if (!Regex.IsMatch(dto.Password, @"^(?=.*\d).{8,}$"))
                return BadRequest(new { message = "Password must be at least 8 characters and contain at least one number." });

            bool emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
                return BadRequest(new { message = "Email is already registered." });

            PasswordSecurity.CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);
            string token = Guid.NewGuid().ToString("N");

            var user = new User
            {
                FullName = dto.FullName,
                PersonalNumber = dto.PersonalNumber,
                Email = dto.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                Role = "User",
                Balance = 0,
                IsConfirmed = false,
                ConfirmationToken = token,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            try
            {
                await _emailSender.SendConfirmationEmailAsync(user.Email, user.FullName, token);
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    message = "Registration successful but confirmation email could not be sent.",
                    emailError = ex.Message,
                    user = MapUser(user)
                });
            }

            return Ok(new
            {
                message = "Registration successful. Please check your email to confirm your account.",
                user = MapUser(user)
            });
        }

       
        [HttpGet("confirm/{token}")]
        public async Task<IActionResult> Confirm(string token)
        {
            string frontendUrl = _configuration["App:FrontendUrl"]!;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ConfirmationToken == token);
            if (user == null) return Redirect($"{frontendUrl}/login?confirmed=invalid");
            if (user.IsConfirmed) return Redirect($"{frontendUrl}/login?confirmed=already");

            user.IsConfirmed = true;
            user.Balance = 1000;
            user.ConfirmationToken = null;
            await _context.SaveChangesAsync();
            return Redirect($"{frontendUrl}/login?confirmed=success");
        }

        [HttpGet("decline/{token}")]
        public async Task<IActionResult> Decline(string token)
        {
            string frontendUrl = _configuration["App:FrontendUrl"]!;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ConfirmationToken == token);
            if (user == null) return Redirect($"{frontendUrl}/login?confirmed=invalid");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Redirect($"{frontendUrl}/login?confirmed=declined");
        }

        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
                return Unauthorized(new { message = $"Account is locked. Try again after {user.LockoutEnd.Value:HH:mm} UTC." });

            bool passwordValid = PasswordSecurity.VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt);
            if (!passwordValid)
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                    user.FailedLoginAttempts = 0;
                }
                await _context.SaveChangesAsync();
                return Unauthorized(new { message = "Invalid email or password." });
            }

            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            string jwtToken = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Login successful.",
                token = jwtToken,          
                user = MapUser(user)
            });
        }

        
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email,          user.Email),
                new Claim(ClaimTypes.Role,           user.Role),
            };

            var jwtToken = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }

        private static object MapUser(User user) => new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.Balance,
            user.IsConfirmed
        };
    }
}