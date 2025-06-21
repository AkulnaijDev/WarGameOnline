namespace WargameOnline.Api.Models;


public class ArmyUnit
{
    public int UnitId { get; set; }
    public int GameId { get; set; }
    public int FactionId { get; set; }
    public int Count { get; set; }
    public int UnitFactionId { get; set; }

}
