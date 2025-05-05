namespace BusinessLogic.Dtos.Auth
{
    public class AuthResponseDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty; 
        public DateTime Expiration { get; set; } 
    }
}
