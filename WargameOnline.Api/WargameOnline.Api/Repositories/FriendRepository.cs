using Dapper;
using Microsoft.Data.Sqlite;

namespace WargameOnline.Api.Repositories
{
    public interface IFriendRepository
    {
        Task SendRequestAsync(int requesterId, int addresseeId);
        Task<bool> AlreadyFriendsOrPending(int requesterId, int addresseeId);
        Task<IEnumerable<User>> GetPendingReceivedAsync(int userId);
        Task<bool> RespondToRequestAsync(int userId, string username, string action);
        Task<IEnumerable<User>> GetAcceptedFriendsAsync(int userId);
        Task<bool> RemoveFriendshipAsync(int userIdA, int userIdB);
    }

    public class FriendRepository : IFriendRepository
    {
        private readonly string _conn;

        public FriendRepository(IConfiguration config) =>
            _conn = config.GetConnectionString("Default");

        public async Task<bool> AlreadyFriendsOrPending(int user1, int user2)
        {
            using var conn = new SqliteConnection(_conn);

            var sql = @"SELECT COUNT(1) FROM Friendships
                WHERE
                  ((RequesterId = @U1 AND AddresseeId = @U2) OR
                   (RequesterId = @U2 AND AddresseeId = @U1))
                  AND Status IN ('Pending', 'Accepted')";

            var exists = await conn.ExecuteScalarAsync<int>(sql, new { U1 = user1, U2 = user2 });
            return exists > 0;
        }


        public async Task SendRequestAsync(int senderId, int receiverId)
        {
            using var conn = new SqliteConnection(_conn);

            // Elimina eventuali richieste rifiutate precedenti
            var delete = @"DELETE FROM Friendships
                   WHERE RequesterId = @Sender AND AddresseeId = @Receiver AND Status = 'Rejected'";
            await conn.ExecuteAsync(delete, new { Sender = senderId, Receiver = receiverId });

            // Inserisci nuova richiesta
            var insert = @"INSERT INTO Friendships (RequesterId, AddresseeId, Status)
                   VALUES (@Sender, @Receiver, 'Pending')";
            await conn.ExecuteAsync(insert, new { Sender = senderId, Receiver = receiverId });
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
              AND f.Status = 'Accept'
              AND u.Id != @userId
        """;
            return await conn.QueryAsync<User>(query, new { userId });
        }

        public async Task<bool> RemoveFriendshipAsync(int userId, int friendId)
        {
            using var conn = new SqliteConnection(_conn);

            var sql = @"DELETE FROM Friendships
                WHERE 
                  (RequesterId = @U1 AND AddresseeId = @U2)
                  OR
                  (RequesterId = @U2 AND AddresseeId = @U1)";

            var rows = await conn.ExecuteAsync(sql, new { U1 = userId, U2 = friendId });
            return rows > 0;
        }

    }

}
