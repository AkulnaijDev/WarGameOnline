using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using WargameOnline.Api.Services;

namespace WargameOnline.Api.Hubs;

[Authorize]
public class FriendsHub : Hub
{
    private static readonly Dictionary<int, string> OnlineUsers = new();

    private readonly IOnlineUserTracker _tracker;

    public FriendsHub(IOnlineUserTracker tracker)
    {
        _tracker = tracker;
    }

    public override async Task OnConnectedAsync()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (int.TryParse(userIdClaim, out int userId))
        {
            OnlineUsers[userId] = Context.ConnectionId;
            _tracker.SetOnline(userId); // 👈 fondamentale
            Console.WriteLine($"🟢 Connessione: utente {userId} → {Context.ConnectionId}");

            await Clients.Others.SendAsync("FriendOnline", userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? e)
    {
        var user = OnlineUsers.FirstOrDefault(p => p.Value == Context.ConnectionId);
        if (user.Key != 0)
        {
            OnlineUsers.Remove(user.Key);
            _tracker.SetOffline(user.Key); // 👈 fondamentale
            Console.WriteLine($"⛔ Disconnessione: utente {user.Key}");

            await Clients.Others.SendAsync("FriendOffline", user.Key);
        }

        await base.OnDisconnectedAsync(e);
    }

    public async Task SendMessage(int toUserId, string message)
    {
        var fromIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(fromIdClaim, out int fromUserId)) return;

        if (OnlineUsers.TryGetValue(toUserId, out var targetConnId))
        {
            await Clients.Client(targetConnId).SendAsync("ReceiveMessage", fromUserId, message);
        }
    }
}
