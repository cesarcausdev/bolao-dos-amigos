using Bolao.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bolao.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class RankingController : ControllerBase
{
    private readonly IRankingService _ranking;

    public RankingController(IRankingService ranking) => _ranking = ranking;

    [HttpGet("ranking")]
    public async Task<IActionResult> GetGlobal([FromQuery] int limit = 50)
    {
        var result = await _ranking.GetGlobalRankingAsync(limit);
        return Ok(result);
    }

    [HttpGet("boloes/{bolaoId:guid}/ranking")]
    public async Task<IActionResult> GetBolao(Guid bolaoId)
    {
        var result = await _ranking.GetBolaoRankingAsync(bolaoId);
        return Ok(result);
    }
}
