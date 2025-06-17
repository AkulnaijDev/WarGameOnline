namespace WargameOnline.Api.Services
{
    public interface IOnlineUserTracker
    {
        void SetOnline(int userId);
        void SetOffline(int userId);
        bool IsOnline(int userId);
        IEnumerable<int> GetOnlineUserIds();
    }

}
