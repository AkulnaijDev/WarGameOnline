using System.Data;
using Microsoft.Data.Sqlite;

namespace WargameOnline.Api.Data
{
    public class DapperContext
    {
        private readonly IConfiguration _config;
        public DapperContext(IConfiguration config) => _config = config;

        public IDbConnection Create() =>
            new SqliteConnection(_config.GetConnectionString("Default"));
    }

}
