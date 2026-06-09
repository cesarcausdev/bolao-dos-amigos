using Bolao.Application.DTOs;

namespace Bolao.Application.Interfaces;

public interface IRankingService
{
    Task<List<RankingEntryDto>> GetGlobalRankingAsync(int limit = 50);
    Task<List<BolaoRankingEntryDto>> GetBolaoRankingAsync(Guid bolaoId);
}
