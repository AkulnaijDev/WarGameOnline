using Dapper;
using Microsoft.Data.Sqlite;
using WargameOnline.Api.Data;
using WargameOnline.Api.Models;

namespace WargameOnline.Api.Repositories;

public interface IArmyRepository
{
    Task<IEnumerable<Army>> GetByUserIdAsync(int userId);
    Task<Army?> GetByIdAsync(int armyId);
    Task<int> CreateAsync(Army army);
    Task UpdateAsync(Army army);
    Task DeleteAsync(int id);
}

public class ArmyRepository : IArmyRepository
{
    private readonly DapperContext _context;
    public ArmyRepository(DapperContext context) => _context = context;

    public async Task<IEnumerable<Army>> GetByUserIdAsync(int userId)
    {
        const string query = """
    SELECT Id, Name, faction_id AS FactionId
    FROM armies
    WHERE user_id = @UserId
""";

        using var conn = _context.Create();
        return await conn.QueryAsync<Army>(query, new { UserId = userId });
    }

    public async Task<Army?> GetByIdAsync(int armyId)
    {
        const string armyQuery = """
            SELECT Id, Name, Game, Faction, user_id AS UserId
            FROM armies
            WHERE Id = @Id
        """;

        const string unitsQuery = """
            SELECT Id, Name, Points, Count, army_id AS ArmyId
            FROM army_units
            WHERE army_id = @Id
        """;

        using var conn = _context.Create();

        var army = await conn.QuerySingleOrDefaultAsync<Army>(armyQuery, new { Id = armyId });
        if (army == null) return null;

        var units = (await conn.QueryAsync<ArmyUnit>(unitsQuery, new { Id = armyId })).ToList();
        army.Units = units;
        return army;
    }

    public async Task<int> CreateAsync(Army army)
    {
        const string armyInsert = """
            INSERT INTO armies (name, game, faction, user_id)
            VALUES (@Name, @Game, @Faction, @UserId);
            SELECT last_insert_rowid();
        """;

        const string unitInsert = """
            INSERT INTO army_units (name, points, count, army_id)
            VALUES (@Name, @Points, @Count, @ArmyId)
        """;

        using var conn = _context.Create();
        conn.Open();
        using var tx = conn.BeginTransaction();

        var newId = await conn.ExecuteScalarAsync<int>(armyInsert, army, tx);
        foreach (var unit in army.Units)
        {
            await conn.ExecuteAsync(unitInsert, new
            {
                unit.Name,
                unit.Points,
                unit.Count,
                ArmyId = newId
            }, tx);
        }

        tx.Commit();
        return newId;
    }

    public async Task UpdateAsync(Army army)
    {
        const string updateQuery = """
            UPDATE armies
            SET name = @Name, game = @Game, faction = @Faction
            WHERE id = @Id
        """;

        const string deleteUnits = "DELETE FROM army_units WHERE army_id = @Id";

        const string insertUnits = """
            INSERT INTO army_units (name, points, count, army_id)
            VALUES (@Name, @Points, @Count, @ArmyId)
        """;

        using var conn = _context.Create();
        using var tx = conn.BeginTransaction();

        await conn.ExecuteAsync(updateQuery, army, tx);
        await conn.ExecuteAsync(deleteUnits, new { army.Id }, tx);

        foreach (var unit in army.Units)
        {
            await conn.ExecuteAsync(insertUnits, new
            {
                unit.Name,
                unit.Points,
                unit.Count,
                ArmyId = army.Id
            }, tx);
        }

        tx.Commit();
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _context.Create();
        using var tx = conn.BeginTransaction();

        await conn.ExecuteAsync("DELETE FROM army_units WHERE army_id = @Id", new { Id = id }, tx);
        await conn.ExecuteAsync("DELETE FROM armies WHERE id = @Id", new { Id = id }, tx);

        tx.Commit();
    }
}

