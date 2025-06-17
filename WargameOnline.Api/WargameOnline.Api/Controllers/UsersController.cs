using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WargameOnline.Api.Repositories;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _repo;

    public UsersController(IUserRepository repo) => _repo = repo;

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (idClaim is null) return Unauthorized();

        var user = await _repo.GetByIdAsync(int.Parse(idClaim));
        if (user is null) return NotFound();

        return Ok(new { user.Id, user.Username, user.Email });
    }
}
