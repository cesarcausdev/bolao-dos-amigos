using Bolao.Application.Interfaces;
using Bolao.Domain.Entities;
using Bolao.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bolao.Infrastructure.Repositories;

public class RankingRepository : IRankingRepository
{
    private readonly AppDbContext _db;

    public RankingRepository(AppDbContext db) => _db = db;

    public Task<List<User>> GetGlobalRankingAsync(int limit = 50) =>
        _db.Users
           .OrderByDescending(u => u.TotalPoints)
           .Take(limit)
           .ToListAsync();

    public Task<List<Palpite>> GetBolaoRankingAsync(Guid bolaoId) =>
        _db.Palpites
           .Include(p => p.User)
           .Where(p => p.BolaoId == bolaoId)
           .OrderByDescending(p => p.Pontos ?? 0)
           .ToListAsync();

    public async Task RecalcGlobalRanksAsync()
    {
        var users = await _db.Users.OrderByDescending(u => u.TotalPoints).ToListAsync();
        for (int i = 0; i < users.Count; i++)
            users[i].BestRank = i + 1;
        await _db.SaveChangesAsync();
    }
}
