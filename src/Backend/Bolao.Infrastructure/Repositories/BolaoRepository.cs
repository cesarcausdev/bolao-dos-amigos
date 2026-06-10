using Bolao.Application.Interfaces;
using Bolao.Domain.Entities;
using Bolao.Domain.Enums;
using Bolao.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bolao.Infrastructure.Repositories;

public class BolaoRepository : IBolaoRepository
{
    private readonly AppDbContext _db;

    public BolaoRepository(AppDbContext db) => _db = db;

    public Task<Bolao.Domain.Entities.Bolao?> GetByIdAsync(Guid id) =>
        _db.Boloes
           .Include(b => b.CreatedBy)
           .Include(b => b.Organizer)
           .FirstOrDefaultAsync(b => b.Id == id);

    public Task<Bolao.Domain.Entities.Bolao?> GetByIdWithDetailsAsync(Guid id) =>
        _db.Boloes
           .Include(b => b.CreatedBy)
           .Include(b => b.Organizer)
           .Include(b => b.Participants).ThenInclude(p => p.User)
           .Include(b => b.Palpites).ThenInclude(p => p.User)
           .FirstOrDefaultAsync(b => b.Id == id);

    public Task<List<Bolao.Domain.Entities.Bolao>> GetAllAsync(BolaoStatus? status = null)
    {
        var query = _db.Boloes
            .Include(b => b.CreatedBy)
            .Include(b => b.Organizer)
            .Include(b => b.Participants)
            .AsQueryable();
        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);
        return query.OrderByDescending(b => b.MatchDate).ToListAsync();
    }

    public Task<List<Bolao.Domain.Entities.Bolao>> GetAbertosExpiredAsync() =>
        _db.Boloes
           .Where(b => b.Status == BolaoStatus.Aberto && b.MatchDate <= DateTime.UtcNow)
           .ToListAsync();

    public async Task AddAsync(Bolao.Domain.Entities.Bolao bolao)
    {
        _db.Boloes.Add(bolao);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Bolao.Domain.Entities.Bolao bolao)
    {
        _db.Boloes.Update(bolao);
        await _db.SaveChangesAsync();
    }

    public Task<bool> IsParticipantAsync(Guid bolaoId, Guid userId) =>
        _db.BolaoParticipants.AnyAsync(p => p.BolaoId == bolaoId && p.UserId == userId);

    public async Task AddParticipantAsync(BolaoParticipant participant)
    {
        _db.BolaoParticipants.Add(participant);
        await _db.SaveChangesAsync();
    }

    public Task<List<BolaoParticipant>> GetParticipantsAsync(Guid bolaoId) =>
        _db.BolaoParticipants
           .Include(p => p.User)
           .Where(p => p.BolaoId == bolaoId)
           .ToListAsync();
}
