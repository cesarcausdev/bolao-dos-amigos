using Bolao.Domain.Entities;

namespace Bolao.Application.Interfaces;

public interface IPalpiteRepository
{
    Task<Palpite?> GetByIdAsync(Guid id);
    Task<Palpite?> GetByBolaoAndUserAsync(Guid bolaoId, Guid userId);
    Task<List<Palpite>> GetByBolaoAsync(Guid bolaoId);
    Task AddAsync(Palpite palpite);
    Task UpdateAsync(Palpite palpite);
    Task UpdatePontosByBolaoAsync(Guid bolaoId);
}
