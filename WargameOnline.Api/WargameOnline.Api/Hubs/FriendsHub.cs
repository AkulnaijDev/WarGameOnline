using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

public class FriendsHub : Hub
{
    private readonly IOnlineUserTracker _tracker;

    public FriendsHub(IOnlineUserTracker tracker)
    {
        _tracker = tracker;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = int.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        Console.WriteLine($"🔌 OnConnected {userId} via {Context.ConnectionId}");

        _tracker.SetOnline(userId, Context.ConnectionId);
        await Clients.Others.SendAsync("FriendOnline", userId);
        await base.OnConnectedAsync();
        Console.WriteLine($"🧲 Connected {userId} via {Context.ConnectionId}");

    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = int.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        _tracker.RemoveConnection(userId, Context.ConnectionId);
        await Clients.Others.SendAsync("FriendOffline", userId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(int toUserId, string message)
    {
        var fromUserId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        Console.WriteLine($"📨 {fromUserId} ➡️ {toUserId}: {message}");

        if (_tracker.TryGetConnections(toUserId, out var connections))
        {
            Console.WriteLine($"📡 Inoltro a: {string.Join(", ", connections)}");
            foreach (var conn in connections)
            {
                await Clients.Client(conn).SendAsync("ReceiveMessage", fromUserId, message);
            }
        }
        else
        {
            Console.WriteLine($"❌ Nessuna connessione trovata per {toUserId}");
        }
    }

}
