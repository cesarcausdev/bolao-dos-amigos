namespace Bolao.Application.DTOs;

public record RegisterDto(
    string Name,
    string Username,
    string Password
);

public record LoginDto(
    string Username,
    string Password
);

public record AuthResultDto(
    string Token,
    UserDto User
);
