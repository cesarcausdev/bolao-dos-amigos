using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Bolao.Shared.Exceptions;

namespace Bolao.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _users;

    public UserService(IUserRepository users)
    {
        _users = users;
    }

    public async Task<UserDto> GetProfileAsync(Guid userId)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw AppException.NotFound("Usuário");

        var count = await _users.CountBoloesAsync(userId);
        return new UserDto(user.Id, user.Name, user.Email, user.Avatar, user.TotalPoints, user.BestRank, count);
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw AppException.NotFound("Usuário");

        if (!string.IsNullOrWhiteSpace(dto.Name))
            user.Name = dto.Name.Trim();

        if (dto.Avatar is not null)
            user.Avatar = dto.Avatar;

        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user);

        var count = await _users.CountBoloesAsync(userId);
        return new UserDto(user.Id, user.Name, user.Email, user.Avatar, user.TotalPoints, user.BestRank, count);
    }
}
