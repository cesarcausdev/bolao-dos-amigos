using Bolao.Application.DTOs;

namespace Bolao.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> GetProfileAsync(Guid userId);
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<List<UserSummaryDto>> GetAllAsync();
}
