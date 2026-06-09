using System.Security.Claims;
using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bolao.Api.Controllers;

[ApiController]
[Route("api/boloes/{bolaoId:guid}/palpites")]
[Authorize]
public class PalpiteController : ControllerBase
{
    private readonly IPalpiteService _palpites;

    public PalpiteController(IPalpiteService palpites) => _palpites = palpites;

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid bolaoId)
    {
        var result = await _palpites.GetByBolaoAsync(bolaoId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Submit(Guid bolaoId, [FromBody] CreatePalpiteDto dto)
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        var result = await _palpites.SubmitAsync(bolaoId, userId, dto);
        return Created($"/api/boloes/{bolaoId}/palpites", result);
    }

    [HttpPut]
    public async Task<IActionResult> Update(Guid bolaoId, [FromBody] CreatePalpiteDto dto)
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        var result = await _palpites.UpdateAsync(bolaoId, userId, dto);
        return Ok(result);
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub");
        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
