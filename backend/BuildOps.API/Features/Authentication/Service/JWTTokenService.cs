using BuildOps.API.Features.Authentication.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BuildOps.API.Features.Authentication.Service;

public class JWTTokenService(IOptions<JWTConfiguration> config) : ITokenService
{
    private readonly JWTConfiguration _config = config.Value;

    public string GenerateAccessToken(User user)
    {
        var handler = new JsonWebTokenHandler();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.EmailId),
                new Claim(JwtRegisteredClaimNames.GivenName, user.Profile.FirstName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            }),
            Expires = DateTime.UtcNow.AddMinutes(_config.AccessTokenExpirationMinutes),
            Issuer = _config.Issuer,
            Audience = _config.Audience,
            SigningCredentials = credentials
        };

        return handler.CreateToken(tokenDescriptor);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}
