using Bolao.Application.DTOs;

namespace Bolao.Application.Interfaces;

public interface IPalpiteService
{
    Task<PalpiteDto> SubmitAsync(Guid bolaoId, Guid userId, CreatePalpiteDto dto);
    Task<PalpiteDto> UpdateAsync(Guid bolaoId, Guid userId, CreatePalpiteDto dto);
    Task<List<PalpiteDto>> GetByBolaoAsync(Guid bolaoId);
}
