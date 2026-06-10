using System.Security.Claims;
using Bolao.Application.DTOs;
using Bolao.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace Bolao.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserService _users;
    private readonly IConfiguration _config;

    public ProfileController(IUserService users, IConfiguration config)
    {
        _users = users;
        _config = config;
    }

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

    [HttpPost("avatar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var userId = GetUserId() ?? throw new UnauthorizedAccessException();

        if (file is null || file.Length == 0)
            return BadRequest(new { error = "Nenhum arquivo enviado." });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/jpg" };
        if (!allowed.Contains(file.ContentType.ToLower()))
            return BadRequest(new { error = "Formato inválido. Use JPG, PNG ou WebP." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { error = "Arquivo muito grande. Máximo 5MB." });

        var cfgPath = _config["UploadPath"] ?? "/app/uploads";
        var absPath = Path.IsPathRooted(cfgPath)
            ? cfgPath
            : Path.Combine(Directory.GetCurrentDirectory(), cfgPath);
        var avatarsDir = Path.Combine(absPath, "avatars");
        Directory.CreateDirectory(avatarsDir);

        var ext = file.ContentType.ToLower() switch
        {
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".jpg",
        };
        var fileName = $"{userId}{ext}";
        var filePath = Path.Combine(avatarsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var avatarUrl = $"/uploads/avatars/{fileName}";
        var result = await _users.UpdateProfileAsync(userId, new UpdateProfileDto(null, null, avatarUrl));
        return Ok(result);
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub");
        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
