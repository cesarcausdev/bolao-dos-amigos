namespace Bolao.Application.DTOs;

public record CreatePalpiteDto(
    int PlacarHome,
    int PlacarAway
);

public record PalpiteDto(
    Guid Id,
    Guid BolaoId,
    Guid UserId,
    string UserName,
    string? UserAvatar,
    int PlacarHome,
    int PlacarAway,
    int? Pontos,
    DateTime CreatedAt
);

public record PalpiteResultDto(
    int PlacarHome,
    int PlacarAway
);
