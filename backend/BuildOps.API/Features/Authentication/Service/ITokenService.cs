using System;
using BuildOps.API.Features.Authentication.Models;

namespace BuildOps.API.Features.Authentication.Service;
public interface ITokenService
{
	string GenerateAccessToken(User user);
	string GenerateRefreshToken();
}
