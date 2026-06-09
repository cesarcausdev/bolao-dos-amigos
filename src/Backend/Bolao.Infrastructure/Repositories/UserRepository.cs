using Bolao.Application.Interfaces;
using Bolao.Domain.Entities;
using Bolao.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Bolao.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public Task<User?> GetByIdAsync(Guid id) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByEmailAsync(string email) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public Task<List<User>> GetAllAsync() =>
        _db.Users.OrderBy(u => u.Name).ToListAsync();

    public async Task AddAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public Task<int> CountBoloesAsync(Guid userId) =>
        _db.BolaoParticipants.CountAsync(p => p.UserId == userId);
}
