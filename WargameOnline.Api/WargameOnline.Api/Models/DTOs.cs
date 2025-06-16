namespace WargameOnline.Api.Models
{
    public class DTOs
    {
        public record RegisterDto(string Username, string Email, string Password);
        public record LoginDto(string Email, string Password);
        public record AuthResult(string Token, string Username);

    }
}
