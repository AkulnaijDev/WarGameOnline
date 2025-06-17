using Dapper;
using Microsoft.Data.Sqlite;

namespace WargameOnline.Api.Repositories
{
    public interface IFriendRepository
    {
        Task SendRequestAsync(int requesterId, int addresseeId);
        Task<bool> AlreadyFriendsOrPending(int requesterId, int addresseeId);
        Task<User?> GetByUsernameAsync(string username);
        Task<IEnumerable<User>> GetPendingReceivedAsync(int userId);
        Task<bool> RespondToRequestAsync(int userId, string username, string action);
        Task<IEnumerable<User>> GetAcceptedFriendsAsync(int userId);


    }


    public class FriendRepository : IFriendRepository
    {
        private readonly string _conn;

        public FriendRepository(IConfiguration config) =>
            _conn = config.GetConnectionString("Default");

        public async Task<bool> AlreadyFriendsOrPending(int a, int b)
        {
            using var conn = new SqliteConnection(_conn);
            const string query = """
          SELECT 1 FROM Friendships
          WHERE (RequesterId = @a AND AddresseeId = @b)
             OR (RequesterId = @b AND AddresseeId = @a)
        """;
            return await conn.QueryFirstOrDefaultAsync<int?>(query, new { a, b }) != null;
        }

        public async Task SendRequestAsync(int requesterId, int addresseeId)
        {
            using var conn = new SqliteConnection(_conn);
            const string query = """
          INSERT INTO Friendships (RequesterId, AddresseeId, Status)
          VALUES (@requesterId, @addresseeId, 'Pending')
        """;
            await conn.ExecuteAsync(query, new { requesterId, addresseeId });
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            const string query = "SELECT * FROM Users WHERE Username = @Username";
            using var conn = new SqliteConnection(_conn); // se usi _context, adatta a _conn
            return await conn.QuerySingleOrDefaultAsync<User>(query, new { Username = username });
        }

        public async Task<IEnumerable<User>> GetPendingReceivedAsync(int userId)
        {
            using var conn = new SqliteConnection(_conn);
            const string query = """
        SELECT u.*
        FROM Friendships f
        JOIN Users u ON u.Id = f.RequesterId
        WHERE f.AddresseeId = @userId AND f.Status = 'Pending'
    """;
            return await conn.QueryAsync<User>(query, new { userId });
        }

        public async Task<bool> RespondToRequestAsync(int addresseeId, string username, string action)
        {
            using var conn = new SqliteConnection(_conn);

            const string getRequester = "SELECT Id FROM Users WHERE Username = @username";
            var requesterId = await conn.QuerySingleOrDefaultAsync<int?>(getRequester, new { username });
            if (requesterId == null) return false;

            const string update = """
        UPDATE Friendships
        SET Status = @action
        WHERE AddresseeId = @addresseeId AND RequesterId = @requesterId AND Status = 'Pending'
    """;

            var rows = await conn.ExecuteAsync(update, new { action, addresseeId, requesterId });
            return rows > 0;
        }

        public async Task<IEnumerable<User>> GetAcceptedFriendsAsync(int userId)
        {
            using var conn = new SqliteConnection(_conn);
            const string query = """
        SELECT u.*
        FROM Friendships f
        JOIN Users u ON (u.Id = f.RequesterId OR u.Id = f.AddresseeId)
        WHERE (f.RequesterId = @userId OR f.AddresseeId = @userId)
          AND f.Status = 'Accepted'
          AND u.Id != @userId
    """;
            return await conn.QueryAsync<User>(query, new { userId });
        }

    }

}
