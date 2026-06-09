using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Bolao.Domain.Entities;
using Bolao.Shared.Exceptions;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Bolao.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordService _passwords;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository users, IPasswordService passwords, IConfiguration config)
    {
        _users = users;
        _passwords = passwords;
        _config = config;
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
    {
        var username = dto.Username.ToLower().Trim();
        var existing = await _users.GetByUsernameAsync(username);
        if (existing is not null)
            throw AppException.Conflict("Username já cadastrado.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Username = username,
            PasswordHash = _passwords.Encrypt(dto.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _users.AddAsync(user);
        return new AuthResultDto(GenerateToken(user), MapUser(user, 0));
    }

    public async Task<AuthResultDto> LoginAsync(LoginDto dto)
    {
        var user = await _users.GetByUsernameAsync(dto.Username.ToLower().Trim())
            ?? throw AppException.Unauthorized("Usuário ou senha inválidos.");

        string decrypted;
        try { decrypted = _passwords.Decrypt(user.PasswordHash); }
        catch { throw AppException.Unauthorized("Usuário ou senha inválidos."); }

        if (decrypted != dto.Password)
            throw AppException.Unauthorized("Usuário ou senha inválidos.");

        var boloesCount = await _users.CountBoloesAsync(user.Id);
        return new AuthResultDto(GenerateToken(user), MapUser(user, boloesCount));
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim("username", user.Username),
            new Claim("name", user.Name),
            new Claim("admin", user.IsAdmin.ToString().ToLower()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapUser(User user, int boloesCount) => new(
        user.Id, user.Name, user.Username, user.Avatar,
        user.TotalPoints, user.BestRank, boloesCount
    );
}
