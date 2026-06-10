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
    Guid CreatedById,
    string CreatedBy,
    Guid? OrganizerId,
    string? OrganizerName,
    decimal ValorBolao,
    string? PixKey,
    int ParticipantCount,
    int PaidCount
);

public record BolaoDetailDto(
    Guid Id,
    TeamDto HomeTeam,
    TeamDto AwayTeam,
    DateTime MatchDate,
    BolaoStatus Status,
    int? HomeScore,
    int? AwayScore,
    Guid CreatedById,
    string CreatedBy,
    Guid? OrganizerId,
    string? OrganizerName,
    decimal ValorBolao,
    string? PixKey,
    int PaidCount,
    List<ParticipantDto> Participants
);

public record ParticipantDto(
    Guid UserId,
    string Name,
    string? Avatar,
    PalpiteResultDto? Palpite,
    int Pontos,
    int Rank,
    bool Pagou
);

public record UpdatePagamentoDto(bool Pagou);

public record CreateBolaoDto(
    string HomeTeamId,
    string HomeTeamName,
    string HomeTeamFlag,
    string AwayTeamId,
    string AwayTeamName,
    string AwayTeamFlag,
    DateTime MatchDate,
    Guid? OrganizerId,
    decimal ValorBolao,
    string? PixKey
);

public record UpdateBolaoDto(
    string HomeTeamId,
    string HomeTeamName,
    string HomeTeamFlag,
    string AwayTeamId,
    string AwayTeamName,
    string AwayTeamFlag,
    DateTime MatchDate,
    Guid? OrganizerId,
    decimal ValorBolao,
    string? PixKey
);

public record SetResultadoDto(
    int HomeScore,
    int AwayScore
);

public record UpdateStatusDto(BolaoStatus Status);
