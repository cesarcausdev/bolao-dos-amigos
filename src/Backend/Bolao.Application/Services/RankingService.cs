using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;

namespace Bolao.Application.Services;

public class RankingService : IRankingService
{
    private readonly IRankingRepository _ranking;
    private readonly IUserRepository _users;

    public RankingService(IRankingRepository ranking, IUserRepository users)
    {
        _ranking = ranking;
        _users = users;
    }

    public async Task<List<RankingEntryDto>> GetGlobalRankingAsync(int limit = 50)
    {
        var users = await _ranking.GetGlobalRankingAsync(limit);
        var result = new List<RankingEntryDto>();

        for (int i = 0; i < users.Count; i++)
        {
            var u = users[i];
            var count = await _users.CountBoloesAsync(u.Id);
            result.Add(new RankingEntryDto(i + 1, u.Id, u.Name, u.Avatar, u.TotalPoints, count));
        }

        return result;
    }

    public async Task<List<BolaoRankingEntryDto>> GetBolaoRankingAsync(Guid bolaoId)
    {
        var palpites = await _ranking.GetBolaoRankingAsync(bolaoId);

        return palpites
            .OrderByDescending(p => p.Pontos ?? 0)
            .Select((p, idx) => new BolaoRankingEntryDto(
                idx + 1,
                p.UserId,
                p.User?.Name ?? string.Empty,
                p.User?.Avatar,
                p.Pontos ?? 0,
                new PalpiteResultDto(p.PlacarHome, p.PlacarAway)
            )).ToList();
    }
}
