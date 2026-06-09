namespace Bolao.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public int TotalPoints { get; set; }
    public int BestRank { get; set; }
    public bool IsAdmin { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<BolaoParticipant> Participations { get; set; } = new List<BolaoParticipant>();
    public ICollection<Palpite> Palpites { get; set; } = new List<Palpite>();
}
