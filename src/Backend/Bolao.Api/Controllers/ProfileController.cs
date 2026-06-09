using System.Security.Claims;
using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bolao.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserService _users;

    public ProfileController(IUserService users) => _users = users;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        var result = await _users.GetProfileAsync(userId);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();
        var result = await _users.UpdateProfileAsync(userId, dto);
        return Ok(result);
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub");
        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
