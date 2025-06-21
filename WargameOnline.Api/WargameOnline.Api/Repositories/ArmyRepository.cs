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
        SELECT id, name, game_id, faction_id, user_id
        FROM armies
        WHERE user_id = @UserId
    """;

        using var conn = _context.Create();
        return await conn.QueryAsync<Army>(query, new { UserId = userId });
    }


    public async Task<Army?> GetByIdAsync(int id)
    {
        const string queryArmy = """
        SELECT id, name, game_id, faction_id, user_id
        FROM armies
        WHERE id = @Id
    """;

        const string queryUnits = """
        SELECT unit_id, game_id, faction_id, count
        FROM army_units
        WHERE army_id = @Id
    """;

        using var conn = _context.Create();

        var army = await conn.QuerySingleOrDefaultAsync<Army>(queryArmy, new { Id = id });
        if (army == null) return null;

        var units = await conn.QueryAsync<ArmyUnit>(queryUnits, new { Id = id });
        army.Units = units.ToList();
        return army;
    }


    public async Task<int> CreateAsync(Army army)
    {
        const string armyInsert = """
    INSERT INTO armies (name, game_id, faction_id, user_id)
    VALUES (@Name, @GameId, @FactionId, @UserId);
    SELECT last_insert_rowid();
""";

        const string unitInsert = """
    INSERT INTO army_units (army_id, unit_id, game_id, faction_id, count)
    VALUES (@ArmyId, @UnitId, @GameId, @FactionId, @Count);
""";

        using var conn = _context.Create();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            var newArmyId = await conn.ExecuteScalarAsync<long>(armyInsert, new
            {
                army.Name,
                army.GameId,
                army.FactionId,
                army.UserId
            }, tx);

            foreach (var unit in army.Units)
            {
                await conn.ExecuteAsync(unitInsert, new
                {
                    ArmyId = newArmyId,
                    unit.UnitId,
                    unit.GameId,
                    unit.FactionId,
                    unit.Count
                }, tx);
            }

            tx.Commit();
            return (int)newArmyId;
        }
        catch (Exception ex)
        {
            tx.Rollback();
            throw new Exception("Errore durante il salvataggio dell'armata", ex);
        }

    }


    public async Task UpdateAsync(Army army)
    {
        const string updateQuery = """
        UPDATE armies
        SET name = @Name, game_id = @GameId, faction_id = @FactionId
        WHERE id = @Id
    """;

        const string deleteUnits = "DELETE FROM army_units WHERE army_id = @Id";

        const string insertUnits = """
        INSERT INTO army_units (army_id, unit_id, game_id, faction_id, count)
        VALUES (@ArmyId, @UnitId, @GameId, @FactionId, @Count)
    """;

        using var conn = _context.Create();
        conn.Open(); // obbligatorio per poter usare la transazione

        using var tx = conn.BeginTransaction();

        try
        {
            await conn.ExecuteAsync(updateQuery, new
            {
                army.Name,
                army.GameId,
                army.FactionId,
                army.Id
            }, tx);

            await conn.ExecuteAsync(deleteUnits, new { army.Id }, tx);

            foreach (var unit in army.Units)
            {
                await conn.ExecuteAsync(insertUnits, new
                {
                    ArmyId = army.Id,
                    UnitId = unit.UnitId,
                    GameId = unit.GameId,
                    FactionId = unit.FactionId,
                    Count = unit.Count
                }, tx);
            }

            tx.Commit();
        }
        catch (Exception ex)
        {
            tx.Rollback();
            throw new Exception("Errore durante l'aggiornamento dell'armata", ex);
        }
    }


    public async Task DeleteAsync(int armyId)
    {
        const string deleteArmy = "DELETE FROM armies WHERE id = @Id";
        using var conn = _context.Create();
        await conn.ExecuteAsync(deleteArmy, new { Id = armyId });
    }

}

