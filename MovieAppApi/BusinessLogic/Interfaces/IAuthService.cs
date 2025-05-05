using BusinessLogic.Dtos.Auth;
using BusinessLogic.Results;

namespace BusinessLogic.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResult> RegisterAsync(RegisterDto registerDto);
        Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto loginDto);
        Task<ServiceResult<AuthResponseDto>> RefreshTokenAsync(string userId);
    }
}
