namespace WargameOnline.Api.Models;
public class Army
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int GameId { get; set; }
    public int FactionId { get; set; }
    public int UserId { get; set; }

    public List<ArmyUnit> Units { get; set; } = new();
}

