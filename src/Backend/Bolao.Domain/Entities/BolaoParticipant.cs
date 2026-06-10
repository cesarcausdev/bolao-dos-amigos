namespace Bolao.Domain.Entities;

public class BolaoParticipant
{
    public Guid Id { get; set; }

    public Guid BolaoId { get; set; }
    public Bolao Bolao { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime JoinedAt { get; set; }
    public bool Pagou { get; set; }
}
