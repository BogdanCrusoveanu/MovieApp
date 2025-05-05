using BusinessLogic.Dtos.Auth;
using BusinessLogic.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MovieAppApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(registerDto);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Registration attempt failed for user {Username}", registerDto.Username);
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error);
                }
                return BadRequest(ModelState);
            }

            return Ok(new { Message = "User registered successfully" });
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(loginDto);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Login attempt failed for identifier {LoginIdentifier}", loginDto.LoginIdentifier);
                return Unauthorized("Invalid credentials.");
            }

            return Ok(result.Data);
        }

        [HttpPost("refresh")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto refreshTokenRequestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RefreshTokenAsync(refreshTokenRequestDto.UserId);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Token refresh attempt failed for UserId {UserId}. Errors: {Errors}",
                    refreshTokenRequestDto.UserId, string.Join(", ", result.Errors));

                if (result.Errors.Contains("User not found."))
                {
                    return NotFound(result.Errors.First());
                }
                return BadRequest("Token refresh failed.");
            }

            return Ok(result.Data);
        }
    }
}
