using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WargameOnline.Api.Repositories;
using WargameOnline.Api.Services;
using static WargameOnline.Api.Models.DTOs;

namespace WargameOnline.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FriendsController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly IFriendRepository _friends;
    private readonly IOnlineUserTracker _tracker;

    public FriendsController(
        IUserRepository users,
        IFriendRepository friends,
        IOnlineUserTracker tracker)
    {
        _users = users;
        _friends = friends;
        _tracker = tracker;
    }

    [HttpPost("request")]
    [Authorize]
    public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto dto)
    {
        var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var targetUser = await _users.GetByUsernameAsync(dto.Username);

        if (targetUser == null || targetUser.Id == currentId)
            return BadRequest("Utente non valido");

        var already = await _friends.AlreadyFriendsOrPending(currentId, targetUser.Id);
        if (already) return Conflict("Richiesta già inviata o già amici");

        await _friends.SendRequestAsync(currentId, targetUser.Id);
        return Ok();
    }

    [HttpPost("respond")]
    [Authorize]
    public async Task<IActionResult> Respond([FromBody] FriendResponseDto dto)
    {
        var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var success = await _friends.RespondToRequestAsync(currentId, dto.Username, dto.Action);

        if (!success) return BadRequest("Errore durante la risposta");
        return Ok();
    }

    [HttpGet("pending")]
    [Authorize]
    public async Task<IActionResult> GetPending()
    {
        var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var users = await _friends.GetPendingReceivedAsync(currentId);
        return Ok(users.Select(u => new { u.Id, u.Username }));
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetFriends()
    {
        var claim = User?.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null)
            return Unauthorized("Utente non autenticato");

        var currentId = int.Parse(claim.Value);
        var friends = await _friends.GetAcceptedFriendsAsync(currentId);

        var result = friends.Select(f => new
        {
            f.Id,
            f.Username,
            IsOnline = _tracker.IsOnline(f.Id)
        });

        return Ok(result);
    }
}
