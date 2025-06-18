public interface IOnlineUserTracker
{
    void SetOnline(int userId, string connectionId);
    void RemoveConnection(int userId, string connectionId);
    bool IsOnline(int userId);
    bool TryGetConnections(int userId, out HashSet<string> connections);
}
