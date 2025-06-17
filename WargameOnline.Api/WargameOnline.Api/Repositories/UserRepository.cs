using Dapper;
using WargameOnline.Api.Data;

namespace WargameOnline.Api.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task AddAsync(User user);
    }

    public class UserRepository : IUserRepository
    {
        private readonly DapperContext _context;
        public UserRepository(DapperContext context) => _context = context;

        public async Task<User?> GetByEmailAsync(string email)
        {
            const string query = "SELECT * FROM Users WHERE Email = @Email";
            using var conn = _context.Create();
            return await conn.QuerySingleOrDefaultAsync<User>(query, new { Email = email });
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            const string query = "SELECT * FROM Users WHERE Id = @Id";
            using var conn = _context.Create();
            return await conn.QuerySingleOrDefaultAsync<User>(query, new { Id = id });
        }

        public async Task AddAsync(User user)
        {
            const string query = """
            INSERT INTO Users (Username, Email, PasswordHash)
            VALUES (@Username, @Email, @PasswordHash)
        """;
            using var conn = _context.Create();
            await conn.ExecuteAsync(query, user);
        }
    }

}
