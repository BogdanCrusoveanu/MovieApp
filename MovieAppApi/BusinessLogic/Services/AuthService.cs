using BusinessLogic.Dtos.Auth;
using BusinessLogic.Interfaces;
using BusinessLogic.Results;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BusinessLogic.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ServiceResult> RegisterAsync(RegisterDto registerDto)
        {
            var user = new ApplicationUser
            {
                UserName = registerDto.Username,
                Email = registerDto.Email
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("User registration failed for {Username}: {Errors}", registerDto.Username, string.Join(", ", errors));
                return ServiceResult.Failed(errors);
            }

            _logger.LogInformation("User {Username} registered successfully.", user.UserName);
            return ServiceResult.Success();
        }

        public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.LoginIdentifier)
                       ?? await _userManager.FindByNameAsync(loginDto.LoginIdentifier);

            if (user == null)
            {
                _logger.LogWarning("Login failed: User not found for identifier {LoginIdentifier}", loginDto.LoginIdentifier);
                return ServiceResult<AuthResponseDto>.Failed("Invalid credentials.");
            }

            var passwordCorrect = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!passwordCorrect)
            {
                _logger.LogWarning("Login failed: Invalid password for user {Username}", user.UserName);
                return ServiceResult<AuthResponseDto>.Failed("Invalid credentials.");
            }

            try
            {
                var authResponse = GenerateJwtToken(user);
                _logger.LogInformation("User {Username} logged in successfully.", user.UserName);
                return ServiceResult<AuthResponseDto>.Success(authResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token for user {Username}", user.UserName);
                return ServiceResult<AuthResponseDto>.Failed("An error occurred during login.");
            }
        }

        public async Task<ServiceResult<AuthResponseDto>> RefreshTokenAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                _logger.LogWarning("Token refresh failed: User not found for ID {UserId}", userId);
                return ServiceResult<AuthResponseDto>.Failed("User not found.");
            }

            try
            {
                var authResponse = GenerateJwtToken(user);
                _logger.LogInformation("Token refreshed successfully for user {Username}", user.UserName);
                return ServiceResult<AuthResponseDto>.Success(authResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token during refresh for user {Username}", user.UserName);
                return ServiceResult<AuthResponseDto>.Failed("An error occurred during token refresh.");
            }
        }

        private AuthResponseDto GenerateJwtToken(ApplicationUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key configuration is missing"));
            var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer configuration is missing");
            var audience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience configuration is missing");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName!),
                    new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return new AuthResponseDto
            {
                UserId = user.Id,
                Username = user.UserName!,
                Email = user.Email ?? string.Empty,
                Token = tokenString,
                Expiration = token.ValidTo
            };
        }
    }
}
