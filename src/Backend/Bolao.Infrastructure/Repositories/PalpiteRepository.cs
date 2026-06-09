using Bolao.Application.Interfaces;
using Bolao.Application.Services;
using Bolao.Domain.Entities;
using Bolao.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bolao.Infrastructure.Repositories;

public class PalpiteRepository : IPalpiteRepository
{
    private readonly AppDbContext _db;

    public PalpiteRepository(AppDbContext db) => _db = db;

    public Task<Palpite?> GetByIdAsync(Guid id) =>
        _db.Palpites.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);

    public Task<Palpite?> GetByBolaoAndUserAsync(Guid bolaoId, Guid userId) =>
        _db.Palpites.Include(p => p.User).FirstOrDefaultAsync(p => p.BolaoId == bolaoId && p.UserId == userId);

    public Task<List<Palpite>> GetByBolaoAsync(Guid bolaoId) =>
        _db.Palpites.Include(p => p.User).Where(p => p.BolaoId == bolaoId).ToListAsync();

    public async Task AddAsync(Palpite palpite)
    {
        _db.Palpites.Add(palpite);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Palpite palpite)
    {
        _db.Palpites.Update(palpite);
        await _db.SaveChangesAsync();
    }

    public async Task UpdatePontosByBolaoAsync(Guid bolaoId)
    {
        var bolao = await _db.Boloes.FirstOrDefaultAsync(b => b.Id == bolaoId);
        if (bolao?.HomeScore is null || bolao.AwayScore is null) return;

        var palpites = await _db.Palpites.Where(p => p.BolaoId == bolaoId).ToListAsync();
        foreach (var p in palpites)
        {
            p.Pontos = PalpiteService.CalculatePontos(p.PlacarHome, p.PlacarAway, bolao.HomeScore.Value, bolao.AwayScore.Value);
            p.UpdatedAt = DateTime.UtcNow;
        }

        // Update global points for each user
        var userIds = palpites.Select(p => p.UserId).Distinct().ToList();
        foreach (var uid in userIds)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == uid);
            if (user is null) continue;
            user.TotalPoints = await _db.Palpites
                .Where(p => p.UserId == uid && p.Pontos.HasValue)
                .SumAsync(p => p.Pontos!.Value);
            user.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }
}
