using Bolao.Domain.Enums;
using BolaoEntity = Bolao.Domain.Entities.Bolao;
using BolaoParticipant = Bolao.Domain.Entities.BolaoParticipant;

namespace Bolao.Application.Interfaces;

public interface IBolaoRepository
{
    Task<BolaoEntity?> GetByIdAsync(Guid id);
    Task<BolaoEntity?> GetByIdWithDetailsAsync(Guid id);
    Task<List<BolaoEntity>> GetAllAsync(BolaoStatus? status = null);
    Task AddAsync(BolaoEntity bolao);
    Task UpdateAsync(BolaoEntity bolao);
    Task<bool> IsParticipantAsync(Guid bolaoId, Guid userId);
    Task AddParticipantAsync(BolaoParticipant participant);
    Task<List<BolaoParticipant>> GetParticipantsAsync(Guid bolaoId);
}
