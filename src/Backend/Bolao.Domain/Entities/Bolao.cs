using Bolao.Domain.Enums;

namespace Bolao.Domain.Entities;

public class Bolao
{
    public Guid Id { get; set; }

    public string HomeTeamId { get; set; } = string.Empty;
    public string HomeTeamName { get; set; } = string.Empty;
    public string HomeTeamFlag { get; set; } = string.Empty;

    public string AwayTeamId { get; set; } = string.Empty;
    public string AwayTeamName { get; set; } = string.Empty;
    public string AwayTeamFlag { get; set; } = string.Empty;

    public DateTime MatchDate { get; set; }
    public BolaoStatus Status { get; set; } = BolaoStatus.Aberto;

    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }

    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;

    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<BolaoParticipant> Participants { get; set; } = new List<BolaoParticipant>();
    public ICollection<Palpite> Palpites { get; set; } = new List<Palpite>();
}
