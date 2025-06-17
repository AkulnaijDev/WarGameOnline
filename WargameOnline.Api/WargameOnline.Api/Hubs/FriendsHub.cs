using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

public class FriendsHub : Hub
{
    private static Dictionary<int, string> OnlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userId, out int id))
        {
            OnlineUsers[id] = Context.ConnectionId;
            await Clients.Others.SendAsync("FriendOnline", id);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? e)
    {
        var user = OnlineUsers.FirstOrDefault(p => p.Value == Context.ConnectionId);
        if (user.Key != 0)
        {
            OnlineUsers.Remove(user.Key);
            await Clients.Others.SendAsync("FriendOffline", user.Key);
        }
        await base.OnDisconnectedAsync(e);
    }

    public async Task SendMessage(int toUserId, string message)
    {
        if (OnlineUsers.TryGetValue(toUserId, out var connId))
        {
            var fromUserId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await Clients.Client(connId).SendAsync("ReceiveMessage", fromUserId, message);
        }
    }
}
