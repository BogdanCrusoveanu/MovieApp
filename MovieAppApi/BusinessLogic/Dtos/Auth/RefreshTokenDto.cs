using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.Dtos.Auth
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
    }
}
