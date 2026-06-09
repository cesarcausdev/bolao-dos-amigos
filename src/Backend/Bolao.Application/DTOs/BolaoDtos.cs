using Bolao.Domain.Enums;

namespace Bolao.Application.DTOs;

public record TeamDto(
    string Id,
    string Name,
    string Flag
);

public record BolaoDto(
    Guid Id,
    TeamDto HomeTeam,
    TeamDto AwayTeam,
    DateTime MatchDate,
    BolaoStatus Status,
    int? HomeScore,
    int? AwayScore,
    string CreatedBy,
    int ParticipantCount
);

public record BolaoDetailDto(
    Guid Id,
    TeamDto HomeTeam,
    TeamDto AwayTeam,
    DateTime MatchDate,
    BolaoStatus Status,
    int? HomeScore,
    int? AwayScore,
    string CreatedBy,
    List<ParticipantDto> Participants
);

public record ParticipantDto(
    Guid UserId,
    string Name,
    string? Avatar,
    PalpiteResultDto? Palpite,
    int Pontos,
    int Rank
);

public record CreateBolaoDto(
    string HomeTeamId,
    string HomeTeamName,
    string HomeTeamFlag,
    string AwayTeamId,
    string AwayTeamName,
    string AwayTeamFlag,
    DateTime MatchDate
);

public record SetResultadoDto(
    int HomeScore,
    int AwayScore
);

public record UpdateStatusDto(BolaoStatus Status);
