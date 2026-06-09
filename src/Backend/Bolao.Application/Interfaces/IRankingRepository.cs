using Bolao.Domain.Entities;

namespace Bolao.Application.Interfaces;

public interface IRankingRepository
{
    Task<List<User>> GetGlobalRankingAsync(int limit = 50);
    Task<List<Palpite>> GetBolaoRankingAsync(Guid bolaoId);
    Task RecalcGlobalRanksAsync();
}
