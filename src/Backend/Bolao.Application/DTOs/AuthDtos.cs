namespace Bolao.Application.DTOs;

public record RegisterDto(
    string Name,
    string Email,
    string Password
);

public record LoginDto(
    string Email,
    string Password
);

public record AuthResultDto(
    string Token,
    UserDto User
);
