namespace Bolao.Application.DTOs;

public record RankingEntryDto(
    int Rank,
    Guid UserId,
    string Name,
    string? Avatar,
    int TotalPoints,
    int BoloesCount
);

public record BolaoRankingEntryDto(
    int Rank,
    Guid UserId,
    string Name,
    string? Avatar,
    int Pontos,
    PalpiteResultDto? Palpite
);
