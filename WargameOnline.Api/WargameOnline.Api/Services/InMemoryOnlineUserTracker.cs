public class InMemoryOnlineUserTracker : IOnlineUserTracker
{
    private readonly Dictionary<int, HashSet<string>> _connections = new();
    private readonly object _lock = new();

    public void SetOnline(int userId, string connectionId)
    {
        lock (_lock)
        {
            if (!_connections.TryGetValue(userId, out var set))
            {
                set = new HashSet<string>();
                _connections[userId] = set;
            }
            set.Add(connectionId);
        }
    }

    public void RemoveConnection(int userId, string connectionId)
    {
        lock (_lock)
        {
            if (_connections.TryGetValue(userId, out var set))
            {
                set.Remove(connectionId);
                if (set.Count == 0)
                {
                    _connections.Remove(userId);
                }
            }
        }
    }

    public bool IsOnline(int userId)
    {
        lock (_lock)
        {
            return _connections.TryGetValue(userId, out var set) && set.Count > 0;
        }
    }

    public bool TryGetConnections(int userId, out HashSet<string> connections)
    {
        lock (_lock)
        {
            if (_connections.TryGetValue(userId, out var set))
            {
                connections = new(set); // 🔒 copia difensiva
                return true;
            }
            connections = [];
            return false;
        }
    }
}
