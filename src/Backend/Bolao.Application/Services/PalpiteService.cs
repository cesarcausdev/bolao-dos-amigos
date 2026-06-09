using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Bolao.Domain.Entities;
using Bolao.Domain.Enums;
using Bolao.Shared.Exceptions;

namespace Bolao.Application.Services;

public class PalpiteService : IPalpiteService
{
    private readonly IPalpiteRepository _palpites;
    private readonly IBolaoRepository _boloes;

    public PalpiteService(IPalpiteRepository palpites, IBolaoRepository boloes)
    {
        _palpites = palpites;
        _boloes = boloes;
    }

    public async Task<PalpiteDto> SubmitAsync(Guid bolaoId, Guid userId, CreatePalpiteDto dto)
    {
        var bolao = await _boloes.GetByIdAsync(bolaoId)
            ?? throw AppException.NotFound("Bolão");

        if (bolao.Status != BolaoStatus.Aberto)
            throw new AppException("Palpites só podem ser enviados enquanto o bolão está Aberto.");

        if (!await _boloes.IsParticipantAsync(bolaoId, userId))
            throw new AppException("Você precisa entrar no bolão antes de enviar um palpite.");

        var existing = await _palpites.GetByBolaoAndUserAsync(bolaoId, userId);
        if (existing is not null)
            throw AppException.Conflict("Você já enviou um palpite para este bolão. Use a edição.");

        var palpite = new Palpite
        {
            Id = Guid.NewGuid(),
            BolaoId = bolaoId,
            UserId = userId,
            PlacarHome = dto.PlacarHome,
            PlacarAway = dto.PlacarAway,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _palpites.AddAsync(palpite);
        palpite.User = (await GetUserOrThrow(userId))!;
        return Map(palpite);
    }

    public async Task<PalpiteDto> UpdateAsync(Guid bolaoId, Guid userId, CreatePalpiteDto dto)
    {
        var bolao = await _boloes.GetByIdAsync(bolaoId)
            ?? throw AppException.NotFound("Bolão");

        if (bolao.Status != BolaoStatus.Aberto)
            throw new AppException("Palpites não podem ser alterados após o início da partida.");

        var palpite = await _palpites.GetByBolaoAndUserAsync(bolaoId, userId)
            ?? throw AppException.NotFound("Palpite");

        if (palpite.UserId != userId)
            throw AppException.Forbidden();

        palpite.PlacarHome = dto.PlacarHome;
        palpite.PlacarAway = dto.PlacarAway;
        palpite.UpdatedAt = DateTime.UtcNow;

        await _palpites.UpdateAsync(palpite);
        return Map(palpite);
    }

    public async Task<List<PalpiteDto>> GetByBolaoAsync(Guid bolaoId)
    {
        var palpites = await _palpites.GetByBolaoAsync(bolaoId);
        return palpites.Select(Map).ToList();
    }

    // Scoring: 10pts exact, 7pts result+one score, 5pts result only, 0pts wrong
    public static int CalculatePontos(int pHome, int pAway, int rHome, int rAway)
    {
        if (pHome == rHome && pAway == rAway) return 10;

        var predictedResult = Math.Sign(pHome - pAway);
        var realResult = Math.Sign(rHome - rAway);

        if (predictedResult != realResult) return 0;

        if (pHome == rHome || pAway == rAway) return 7;

        return 5;
    }

    private Task<Domain.Entities.User?> GetUserOrThrow(Guid userId) =>
        Task.FromResult<Domain.Entities.User?>(null); // resolved via EF include

    private static PalpiteDto Map(Palpite p) => new(
        p.Id,
        p.BolaoId,
        p.UserId,
        p.User?.Name ?? string.Empty,
        p.User?.Avatar,
        p.PlacarHome,
        p.PlacarAway,
        p.Pontos,
        p.CreatedAt
    );
}
