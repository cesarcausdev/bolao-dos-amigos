using System.Text;
using Bolao.Application.Interfaces;
using Bolao.Application.Services;
using Bolao.Infrastructure.Data;
using Bolao.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

namespace Bolao.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var connStr = ResolveConnectionString(config);

        services.AddDbContext<AppDbContext>(opts =>
            opts.UseNpgsql(connStr, npgsql =>
                npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBolaoRepository, BolaoRepository>();
        services.AddScoped<IPalpiteRepository, PalpiteRepository>();
        services.AddScoped<IRankingRepository, RankingRepository>();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBolaoService, BolaoService>();
        services.AddScoped<IPalpiteService, PalpiteService>();
        services.AddScoped<IRankingService, RankingService>();
        services.AddScoped<IUserService, UserService>();
        services.AddHostedService<BolaoStatusTransitionService>();

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
    {
        var key = config["Jwt:Key"].NullIfEmpty() ?? throw new InvalidOperationException("Jwt:Key não configurado.");
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opts =>
            {
                opts.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = config["Jwt:Issuer"],
                    ValidAudience = config["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                };
            });
        services.AddAuthorization();
        return services;
    }

    private static string? NullIfEmpty(this string? s) => string.IsNullOrWhiteSpace(s) ? null : s;

    // Accepts both Npgsql format and Railway PostgreSQL URI format
    private static string ResolveConnectionString(IConfiguration config)
    {
        var connStr = config.GetConnectionString("PostgreSQL").NullIfEmpty()
            ?? Environment.GetEnvironmentVariable("DATABASE_URL").NullIfEmpty()
            ?? Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL").NullIfEmpty()
            ?? throw new InvalidOperationException("Connection string PostgreSQL não configurada.");

        if (!connStr.StartsWith("postgresql://") && !connStr.StartsWith("postgres://"))
            return connStr;

        var uri = new Uri(connStr);
        var userInfo = uri.UserInfo.Split(':');
        var builder = new Npgsql.NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
            SslMode = Npgsql.SslMode.Require,
            TrustServerCertificate = true
        };
        return builder.ConnectionString;
    }
}
