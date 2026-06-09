namespace Bolao.Application.DTOs;

public record UserDto(
    Guid Id,
    string Name,
    string Email,
    string? Avatar,
    int TotalPoints,
    int BestRank,
    int BoloesCount
);

public record UpdateProfileDto(
    string? Name,
    string? Avatar
);
