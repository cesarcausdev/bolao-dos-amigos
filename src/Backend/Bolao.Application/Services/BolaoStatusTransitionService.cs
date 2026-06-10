using Bolao.Application.Interfaces;
using Bolao.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Bolao.Application.Services;

public class BolaoStatusTransitionService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BolaoStatusTransitionService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(60);

    public BolaoStatusTransitionService(
        IServiceScopeFactory scopeFactory,
        ILogger<BolaoStatusTransitionService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BolaoStatusTransitionService iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await TransitionExpiredBoloes();
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task TransitionExpiredBoloes()
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<IBolaoRepository>();

            var expired = await repo.GetAbertosExpiredAsync();
            if (expired.Count == 0) return;

            foreach (var bolao in expired)
            {
                bolao.Status = BolaoStatus.EmAndamento;
                bolao.UpdatedAt = DateTime.UtcNow;
                await repo.UpdateAsync(bolao);
            }

            _logger.LogInformation(
                "Transicionados {Count} bolão(ões) Aberto→EmAndamento.",
                expired.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao transicionar status dos bolões.");
        }
    }
}
