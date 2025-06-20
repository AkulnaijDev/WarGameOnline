namespace WargameOnline.Api.Models;

public class ArmyUnit
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Points { get; set; }
    public int Count { get; set; }
    public int ArmyId { get; set; }
}
