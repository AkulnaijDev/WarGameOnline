using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static WargameOnline.Api.Models.DTOs;
using System.Security.Claims;
using WargameOnline.Api.Repositories;
using WargameOnline.Api.Services;

namespace WargameOnline.Api.Controllers
{
    [Authorize]
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
        public async Task<IActionResult> SendFriendRequest(FriendRequestDto dto)
        {
            var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var targetUser = await _users.GetByUsernameAsync(dto.Username);

            if (targetUser == null || targetUser.Id == currentId)
                return BadRequest("Utente non valido");

            if (await _friends.AlreadyFriendsOrPending(currentId, targetUser.Id))
                return Conflict("Richiesta già inviata o utenti già amici");

            await _friends.SendRequestAsync(currentId, targetUser.Id);
            Console.WriteLine($"Richiesta a username: {dto.Username}");

            return Ok("Richiesta inviata");
        }

        [HttpGet("pending")]
        [Authorize]
        public async Task<IActionResult> GetPendingRequests()
        {
            var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var pending = await _friends.GetPendingReceivedAsync(currentId);
            return Ok(pending);
        }

        [HttpPost("respond")]
        [Authorize]
        public async Task<IActionResult> RespondToFriendRequest(FriendResponseDto dto)
        {
            var currentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ok = await _friends.RespondToRequestAsync(currentId, dto.Username, dto.Action);

            if (!ok)
                return NotFound("Richiesta non trovata o già gestita");

            return Ok($"Richiesta {dto.Action.ToLower()} a {dto.Username}");
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetFriends()
        {
            var claim = User?.FindFirst("id");
            if (claim == null)
                return Unauthorized("Utente non autenticato");

            var currentId = int.Parse(claim.Value);
            var friends = await _friends.GetAcceptedFriendsAsync(currentId);

            var result = friends.Select(f => new {
                f.Id,
                f.Username,
                IsOnline = _tracker.IsOnline(f.Id)
            });

            return Ok(result);
        }




    }

}
