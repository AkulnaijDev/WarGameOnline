using Microsoft.AspNetCore.Mvc;
using static WargameOnline.Api.Models.DTOs;
using WargameOnline.Api.Repositories;
using System.Security.Claims;

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

        var accessToken = _auth.GenerateJwtToken(user);
        var refreshToken = _auth.GenerateRefreshToken(); // 👈 serve aggiungere questo metodo sotto

        await _repo.UpdateRefreshTokenAsync(user.Id, refreshToken);

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new AuthResult(accessToken, user.Username));
    }


    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshAccessToken()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            return Unauthorized("Token di refresh mancante");

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);
        var storedToken = await _repo.GetRefreshTokenAsync(userId);

        if (storedToken != refreshToken)
            return Unauthorized("Refresh token non valido");

        var user = await _repo.GetByIdAsync(userId);
        if (user == null) return Unauthorized();

        var newJwt = _auth.GenerateJwtToken(user);

        return Ok(new { token = newJwt });
    }

}
