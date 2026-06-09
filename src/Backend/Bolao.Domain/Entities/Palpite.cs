namespace Bolao.Domain.Entities;

public class Palpite
{
    public Guid Id { get; set; }

    public Guid BolaoId { get; set; }
    public Bolao Bolao { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public int PlacarHome { get; set; }
    public int PlacarAway { get; set; }

    public int? Pontos { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
