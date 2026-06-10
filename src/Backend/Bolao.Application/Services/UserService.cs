using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Bolao.Shared.Exceptions;

namespace Bolao.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _users;
    private readonly IPasswordService _passwords;

    public UserService(IUserRepository users, IPasswordService passwords)
    {
        _users = users;
        _passwords = passwords;
    }

    public async Task<UserDto> GetProfileAsync(Guid userId)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw AppException.NotFound("Usuário");

        var count = await _users.CountBoloesAsync(userId);
        return new UserDto(user.Id, user.Name, user.Username, user.Avatar, user.TotalPoints, user.BestRank, count);
    }

    public async Task<List<UserSummaryDto>> GetAllAsync()
    {
        var users = await _users.GetAllAsync();
        return users.Select(u => new UserSummaryDto(u.Id, u.Name, u.Username, u.Avatar)).ToList();
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw AppException.NotFound("Usuário");

        if (!string.IsNullOrWhiteSpace(dto.Name))
            user.Name = dto.Name.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Username))
        {
            var newUsername = dto.Username.ToLower().Trim();
            var taken = await _users.GetByUsernameAsync(newUsername);
            if (taken is not null && taken.Id != userId)
                throw AppException.Conflict("Username já está em uso.");
            user.Username = newUsername;
        }

        if (dto.Avatar is not null)
            user.Avatar = dto.Avatar;

        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                throw new AppException("Informe a senha atual para alterá-la.");

            string current;
            try { current = _passwords.Decrypt(user.PasswordHash); }
            catch { throw new AppException("Senha atual inválida."); }

            if (current != dto.CurrentPassword)
                throw new AppException("Senha atual incorreta.");

            user.PasswordHash = _passwords.Encrypt(dto.NewPassword);
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user);

        var count = await _users.CountBoloesAsync(userId);
        return new UserDto(user.Id, user.Name, user.Username, user.Avatar, user.TotalPoints, user.BestRank, count);
    }
}
