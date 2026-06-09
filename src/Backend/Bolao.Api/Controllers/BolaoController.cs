using System.Security.Claims;
using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Bolao.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bolao.Api.Controllers;

[ApiController]
[Route("api/boloes")]
[Authorize]
public class BolaoController : ControllerBase
{
    private readonly IBolaoService _boloes;

    public BolaoController(IBolaoService boloes) => _boloes = boloes;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] BolaoStatus? status = null)
    {
        var result = await _boloes.GetAllAsync(status);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var userId = GetUserId();
        var result = await _boloes.GetDetailAsync(id, userId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBolaoDto dto)
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        var result = await _boloes.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetDetail), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/join")]
    public async Task<IActionResult> Join(Guid id)
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        await _boloes.JoinAsync(id, userId);
        return NoContent();
    }

    [HttpPut("{id:guid}/resultado")]
    public async Task<IActionResult> SetResultado(Guid id, [FromBody] SetResultadoDto dto)
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        await _boloes.SetResultadoAsync(id, dto, userId);
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        await _boloes.UpdateStatusAsync(id, dto, userId);
        return NoContent();
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub");
        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
