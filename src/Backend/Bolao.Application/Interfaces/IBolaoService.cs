using Bolao.Application.DTOs;
using Bolao.Domain.Enums;

namespace Bolao.Application.Interfaces;

public interface IBolaoService
{
    Task<List<BolaoDto>> GetAllAsync(BolaoStatus? status = null);
    Task<BolaoDetailDto> GetDetailAsync(Guid id, Guid? requestingUserId = null);
    Task<BolaoDto> CreateAsync(CreateBolaoDto dto, Guid createdById);
    Task<BolaoDto> UpdateAsync(Guid bolaoId, UpdateBolaoDto dto, Guid requestingUserId);
    Task JoinAsync(Guid bolaoId, Guid userId);
    Task SetResultadoAsync(Guid bolaoId, SetResultadoDto dto, Guid requestingUserId);
    Task UpdateStatusAsync(Guid bolaoId, UpdateStatusDto dto, Guid requestingUserId);
}
