using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WargameOnline.Api.Models;
using WargameOnline.Api.Repositories;

namespace WargameOnline.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ArmiesController : ControllerBase
{
    private readonly IArmyRepository _armyRepository;
   
    public ArmiesController(IArmyRepository armyRepository)
    {
        _armyRepository = armyRepository;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(userIdClaim!.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyArmies()
    {
        var userId = GetUserId();
        var armies = await _armyRepository.GetByUserIdAsync(userId);
        return Ok(armies);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetArmyById(int id)
    {
        var userId = GetUserId();
        var army = await _armyRepository.GetByIdAsync(id);

        if (army == null || army.UserId != userId)
            return Forbid();

        return Ok(army);
    }

    [HttpPost]
    public async Task<IActionResult> SaveArmy([FromBody] Army army)
    {
        var userId = GetUserId();
        army.UserId = userId;

        if (army.Id > 0)
        {
            await _armyRepository.UpdateAsync(army);
            return Ok(new { id = army.Id });
        }
        else
        {
            var newId = await _armyRepository.CreateAsync(army);
            return Ok(new { id = newId });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArmy(int id)
    {
        var userId = GetUserId();
        var existing = await _armyRepository.GetByIdAsync(id);

        if (existing == null || existing.UserId != userId)
            return Forbid();

        await _armyRepository.DeleteAsync(id);
        return NoContent();
    }
}
