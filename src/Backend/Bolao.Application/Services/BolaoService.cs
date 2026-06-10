using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Bolao.Domain.Enums;
using Bolao.Shared.Exceptions;
using BolaoEntity = Bolao.Domain.Entities.Bolao;
using BolaoParticipant = Bolao.Domain.Entities.BolaoParticipant;

namespace Bolao.Application.Services;

public class BolaoService : IBolaoService
{
    private readonly IBolaoRepository _boloes;
    private readonly IUserRepository _users;
    private readonly IPalpiteRepository _palpites;

    public BolaoService(IBolaoRepository boloes, IUserRepository users, IPalpiteRepository palpites)
    {
        _boloes = boloes;
        _users = users;
        _palpites = palpites;
    }

    public async Task<List<BolaoDto>> GetAllAsync(BolaoStatus? status = null)
    {
        var boloes = await _boloes.GetAllAsync(status);
        return boloes.Select(MapToDto).ToList();
    }

    public async Task<BolaoDetailDto> GetDetailAsync(Guid id, Guid? requestingUserId = null)
    {
        var bolao = await _boloes.GetByIdWithDetailsAsync(id)
            ?? throw AppException.NotFound("Bolão");

        var palpitesPorUser = bolao.Palpites.ToDictionary(p => p.UserId);

        var canSeePagou = requestingUserId.HasValue && (
            requestingUserId.Value == bolao.CreatedById ||
            requestingUserId.Value == bolao.OrganizerId
        );

        var participants = bolao.Participants
            .Where(p => palpitesPorUser.ContainsKey(p.UserId))
            .OrderByDescending(p => palpitesPorUser.TryGetValue(p.UserId, out var pal) ? pal.Pontos ?? 0 : 0)
            .Select((p, idx) =>
            {
                palpitesPorUser.TryGetValue(p.UserId, out var palpite);
                return new ParticipantDto(
                    p.UserId,
                    p.User.Name,
                    p.User.Avatar,
                    palpite is not null ? new PalpiteResultDto(palpite.PlacarHome, palpite.PlacarAway) : null,
                    palpite?.Pontos ?? 0,
                    idx + 1,
                    canSeePagou && p.Pagou
                );
            }).ToList();

        var paidCount = bolao.Participants
            .Where(p => palpitesPorUser.ContainsKey(p.UserId))
            .Count(p => p.Pagou);

        return new BolaoDetailDto(
            bolao.Id,
            new TeamDto(bolao.HomeTeamId, bolao.HomeTeamName, bolao.HomeTeamFlag),
            new TeamDto(bolao.AwayTeamId, bolao.AwayTeamName, bolao.AwayTeamFlag),
            bolao.MatchDate,
            bolao.Status,
            bolao.HomeScore,
            bolao.AwayScore,
            bolao.CreatedById,
            bolao.CreatedBy.Name,
            bolao.OrganizerId,
            bolao.Organizer?.Name,
            bolao.ValorBolao,
            bolao.PixKey,
            paidCount,
            participants
        );
    }

    public async Task<BolaoDto> CreateAsync(CreateBolaoDto dto, Guid createdById)
    {
        var creator = await _users.GetByIdAsync(createdById)
            ?? throw AppException.NotFound("Usuário");

        var bolao = new BolaoEntity
        {
            Id = Guid.NewGuid(),
            HomeTeamId = dto.HomeTeamId,
            HomeTeamName = dto.HomeTeamName,
            HomeTeamFlag = dto.HomeTeamFlag,
            AwayTeamId = dto.AwayTeamId,
            AwayTeamName = dto.AwayTeamName,
            AwayTeamFlag = dto.AwayTeamFlag,
            MatchDate = dto.MatchDate.ToUniversalTime(),
            Status = BolaoStatus.Aberto,
            CreatedById = createdById,
            OrganizerId = dto.OrganizerId,
            ValorBolao = dto.ValorBolao,
            PixKey = dto.PixKey,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _boloes.AddAsync(bolao);

        // Creator joins automatically
        await _boloes.AddParticipantAsync(new BolaoParticipant
        {
            Id = Guid.NewGuid(),
            BolaoId = bolao.Id,
            UserId = createdById,
            JoinedAt = DateTime.UtcNow
        });

        bolao.CreatedBy = creator;
        if (dto.OrganizerId.HasValue)
            bolao.Organizer = await _users.GetByIdAsync(dto.OrganizerId.Value);

        return MapToDto(bolao);
    }

    public async Task<BolaoDto> UpdateAsync(Guid bolaoId, UpdateBolaoDto dto, Guid requestingUserId)
    {
        var bolao = await _boloes.GetByIdAsync(bolaoId)
            ?? throw AppException.NotFound("Bolão");

        var user = await _users.GetByIdAsync(requestingUserId)
            ?? throw AppException.NotFound("Usuário");

        var isCreator   = bolao.CreatedById == requestingUserId;
        var isOrganizer = bolao.OrganizerId == requestingUserId;

        if (!isCreator && !isOrganizer && !user.IsAdmin)
            throw AppException.Forbidden("Apenas o criador, organizador ou admin pode editar este bolão.");

        bolao.HomeTeamId   = dto.HomeTeamId;
        bolao.HomeTeamName = dto.HomeTeamName;
        bolao.HomeTeamFlag = dto.HomeTeamFlag;
        bolao.AwayTeamId   = dto.AwayTeamId;
        bolao.AwayTeamName = dto.AwayTeamName;
        bolao.AwayTeamFlag = dto.AwayTeamFlag;
        bolao.MatchDate    = dto.MatchDate.ToUniversalTime();
        bolao.OrganizerId  = dto.OrganizerId;
        bolao.ValorBolao   = dto.ValorBolao;
        bolao.PixKey       = dto.PixKey;
        bolao.UpdatedAt    = DateTime.UtcNow;

        await _boloes.UpdateAsync(bolao);

        if (dto.OrganizerId.HasValue)
            bolao.Organizer = await _users.GetByIdAsync(dto.OrganizerId.Value);

        return MapToDto(bolao);
    }

    public async Task JoinAsync(Guid bolaoId, Guid userId)
    {
        var bolao = await _boloes.GetByIdAsync(bolaoId)
            ?? throw AppException.NotFound("Bolão");

        if (bolao.Status != BolaoStatus.Aberto)
            throw new AppException("Este bolão não está mais aberto para novos participantes.");

        if (await _boloes.IsParticipantAsync(bolaoId, userId))
            throw AppException.Conflict("Você já está participando deste bolão.");

        await _boloes.AddParticipantAsync(new BolaoParticipant
        {
            Id = Guid.NewGuid(),
            BolaoId = bolaoId,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        });
    }

    public async Task SetResultadoAsync(Guid bolaoId, SetResultadoDto dto, Guid requestingUserId)
    {
        var bolao = await _boloes.GetByIdAsync(bolaoId)
            ?? throw AppException.NotFound("Bolão");

        var user = await _users.GetByIdAsync(requestingUserId)
            ?? throw AppException.NotFound("Usuário");

        if (bolao.CreatedById != requestingUserId && !user.IsAdmin)
            throw AppException.Forbidden("Apenas o criador ou admin pode definir o resultado.");

        bolao.HomeScore = dto.HomeScore;
        bolao.AwayScore = dto.AwayScore;
        bolao.Status = BolaoStatus.Encerrado;
        bolao.UpdatedAt = DateTime.UtcNow;

        await _boloes.UpdateAsync(bolao);
        await _palpites.UpdatePontosByBolaoAsync(bolaoId);
    }

    public async Task UpdateStatusAsync(Guid bolaoId, UpdateStatusDto dto, Guid requestingUserId)
    {
        var bolao = await _boloes.GetByIdAsync(bolaoId)
            ?? throw AppException.NotFound("Bolão");

        var user = await _users.GetByIdAsync(requestingUserId)
            ?? throw AppException.NotFound("Usuário");

        if (bolao.CreatedById != requestingUserId && !user.IsAdmin)
            throw AppException.Forbidden("Apenas o criador ou admin pode alterar o status.");

        bolao.Status = dto.Status;
        bolao.UpdatedAt = DateTime.UtcNow;
        await _boloes.UpdateAsync(bolao);
    }

    private static BolaoDto MapToDto(BolaoEntity b) => new(
        b.Id,
        new TeamDto(b.HomeTeamId, b.HomeTeamName, b.HomeTeamFlag),
        new TeamDto(b.AwayTeamId, b.AwayTeamName, b.AwayTeamFlag),
        b.MatchDate,
        b.Status,
        b.HomeScore,
        b.AwayScore,
        b.CreatedById,
        b.CreatedBy?.Name ?? string.Empty,
        b.OrganizerId,
        b.Organizer?.Name,
        b.ValorBolao,
        b.PixKey,
        b.Participants?.Count ?? 0,
        b.Participants?.Count(p => p.Pagou) ?? 0
    );

    public async Task UpdatePagamentoAsync(Guid bolaoId, Guid targetUserId, UpdatePagamentoDto dto, Guid requestingUserId)
    {
        var bolao = await _boloes.GetByIdAsync(bolaoId)
            ?? throw AppException.NotFound("Bolão");

        var requester = await _users.GetByIdAsync(requestingUserId)
            ?? throw AppException.NotFound("Usuário");

        var isCreator   = bolao.CreatedById == requestingUserId;
        var isOrganizer = bolao.OrganizerId == requestingUserId;

        if (!isCreator && !isOrganizer && !requester.IsAdmin)
            throw AppException.Forbidden("Apenas o criador ou organizador pode gerenciar pagamentos.");

        var participant = await _boloes.GetParticipantAsync(bolaoId, targetUserId)
            ?? throw AppException.NotFound("Participante");

        participant.Pagou = dto.Pagou;
        await _boloes.UpdateParticipantAsync(participant);
    }
}
