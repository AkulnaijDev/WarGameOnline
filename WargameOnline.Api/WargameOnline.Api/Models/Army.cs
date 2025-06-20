namespace WargameOnline.Api.Models;

public class Army
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Game { get; set; } = string.Empty;
    public string Faction { get; set; } = string.Empty;
    public int UserId { get; set; }

    public List<ArmyUnit> Units { get; set; } = new();
}
