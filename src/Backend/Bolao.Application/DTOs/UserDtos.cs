namespace Bolao.Application.DTOs;

public record UserDto(
    Guid Id,
    string Name,
    string Username,
    string? Avatar,
    int TotalPoints,
    int BestRank,
    int BoloesCount
);

public record UpdateProfileDto(
    string? Name,
    string? Username,
    string? Avatar
);
