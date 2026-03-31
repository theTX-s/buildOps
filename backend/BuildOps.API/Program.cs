using BuildOps.API.Data;
using BuildOps.API.Features.Authentication.Handler;
using BuildOps.API.Features.Authentication.Interfaces.Handler;
using BuildOps.API.Features.Authentication.Interfaces.Repository;
using BuildOps.API.Features.Authentication.Models;
using BuildOps.API.Features.Authentication.Repository;
using BuildOps.API.Features.Authentication.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString, npgsqlOptions =>
{
    npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
    npgsqlOptions.CommandTimeout(30);
}).UseSnakeCaseNamingConvention());

builder.Services.AddControllers();

builder.Services.Configure<JWTConfiguration>(
    builder.Configuration.GetSection(JWTConfiguration.SectionName));

builder.Services.Configure<PasswordHasherOptions>(options =>
{
    options.CompatibilityMode = PasswordHasherCompatibilityMode.IdentityV3;
    options.IterationCount = 100_000;
});

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<ITokenService, JWTTokenService>();
builder.Services.AddScoped<IAuthHandler, AuthHandler>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();

builder.Services.AddOpenApi();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
    };
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers().RequireAuthorization();

app.Run();
