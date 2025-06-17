using Microsoft.AspNetCore.Mvc;
using static WargameOnline.Api.Models.DTOs;
using WargameOnline.Api.Repositories;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _repo;
    private readonly AuthService _auth;

    public AuthController(IUserRepository repo, AuthService auth)
    {
        _repo = repo;
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = new User { Username = dto.Username, Email = dto.Email, PasswordHash = hashed };
        await _repo.AddAsync(user);
        return Ok("Utente registrato");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _repo.GetByEmailAsync(dto.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Credenziali non valide");

        var token = _auth.GenerateJwtToken(user);
        return Ok(new AuthResult(token, user.Username));
    }
}
