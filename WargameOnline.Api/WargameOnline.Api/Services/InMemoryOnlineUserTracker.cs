namespace WargameOnline.Api.Services
{
    public class InMemoryOnlineUserTracker : IOnlineUserTracker
    {
        private readonly HashSet<int> _online = new();

        public void SetOnline(int userId) => _online.Add(userId);
        public void SetOffline(int userId) => _online.Remove(userId);
        public bool IsOnline(int userId) => _online.Contains(userId);
        public IEnumerable<int> GetOnlineUserIds() => _online;
    }

}
