using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
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
    private readonly IHubContext<FriendsHub> _hub;

    public FriendsController(
        IUserRepository users,
        IFriendRepository friends,
        IOnlineUserTracker tracker,
        IHubContext<FriendsHub> hub)
    {
        _users = users;
        _friends = friends;
        _tracker = tracker;
        _hub = hub;
    }

    [HttpPost("request")]
    [Authorize]
    public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto dto)
    {
        var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var sender = await _users.GetByIdAsync(currentId);
        var receiver = await _users.GetByUsernameAsync(dto.Username);

        if (receiver == null || receiver.Id == currentId)
            return BadRequest("Utente non valido");

        var already = await _friends.AlreadyFriendsOrPending(currentId, receiver.Id);
        if (already) return Conflict("Richiesta già inviata o già amici");

        await _friends.SendRequestAsync(currentId, receiver.Id);

        // 📣 Notifica il ricevente
        await _hub.Clients.User(receiver.Id.ToString()).SendAsync("FriendRequestReceived", new
        {
            id = sender.Id,
            username = sender.Username
        });

        return Ok();
    }

    [HttpPost("respond")]
    [Authorize]
    public async Task<IActionResult> Respond([FromBody] FriendResponseDto dto)
    {
        var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var success = await _friends.RespondToRequestAsync(currentId, dto.Username, dto.Action);
        if (!success) return BadRequest("Errore durante la risposta");

        if (dto.Action == "Accept")
        {
            var receiver = await _users.GetByIdAsync(currentId);
            var requester = await _users.GetByUsernameAsync(dto.Username);

            if (receiver != null && requester != null)
            {
                await _hub.Clients.User(requester.Id.ToString()).SendAsync("FriendRequestAccepted", new
                {
                    id = receiver.Id,
                    username = receiver.Username,
                    isOnline = _tracker.IsOnline(receiver.Id)
                });

                // Notifica anche chi ha accettato (cioè l'utente corrente)
                await _hub.Clients.User(receiver.Id.ToString()).SendAsync("FriendRequestAccepted", new
                {
                    id = requester.Id,
                    username = requester.Username,
                    isOnline = _tracker.IsOnline(requester.Id)
                });
            }
        }

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

    [HttpDelete("{friendId}")]
    [Authorize]
    public async Task<IActionResult> RemoveFriend(int friendId)
    {
        var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var success = await _friends.RemoveFriendshipAsync(currentId, friendId);
        if (!success) return NotFound("Amicizia non trovata");
        // Notifica chi è stato rimosso
        await _hub.Clients.User(friendId.ToString()).SendAsync("FriendRemoved", currentId);
        await _hub.Clients.User(currentId.ToString()).SendAsync("FriendRemoved", friendId);

        return Ok();
    }

}
