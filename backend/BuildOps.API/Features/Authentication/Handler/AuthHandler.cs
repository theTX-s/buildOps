using BuildOps.API.Features.Authentication.DTOs;
using BuildOps.API.Features.Authentication.Interfaces.Handler;
using BuildOps.API.Features.Authentication.Interfaces.Repository;
using BuildOps.API.Features.Authentication.Models;
using BuildOps.API.Features.Authentication.Service;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BuildOps.API.Features.Authentication.Handler;

public class AuthHandler(IAuthRepository repository, ITokenService tokenService, IOptions<JWTConfiguration> config, IPasswordHasher<User> hasher) : IAuthHandler
{
    private readonly JWTConfiguration _config = config.Value;

    public async Task<LogInResponse?> LogInAsync(LogInRequest logInRequest)
    {
        var user = await repository.GetUserByEmailId(logInRequest.EmailId);
        if (user == null)
        {
            return null;
        }
        var userCredential = await repository.GetUserCredentialByUserId(user.Id);
        if (userCredential == null)
        {
            return null;
        }

        var isPasswordMatched = hasher.VerifyHashedPassword(user, userCredential.PasswordHash, logInRequest.Password);
        if (isPasswordMatched == PasswordVerificationResult.Failed)
        {
            return null;
        }
        var strategy = repository.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await repository.BeginTransationAsync();
            try
            {
                var tokens = await GenerateAccessAndRefreshTokenAsync(user);
                await transaction.CommitAsync();
                return tokens;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<LogInResponse?> SignUpAsync(SignUpRequest signUpRequest)
    {
        var strategy = repository.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await repository.BeginTransationAsync();
            try
            {
                var alreadyExists = await repository.UserExists(signUpRequest.EmailId, signUpRequest.PhoneNumber);
                if (alreadyExists)
                    return null;

                var nameArray = signUpRequest.FullName.Trim().Split(" ", StringSplitOptions.RemoveEmptyEntries);
                User user = new()
                {
                    EmailId = signUpRequest.EmailId,
                    PhoneNumber = signUpRequest.PhoneNumber,
                    Profile = new()
                    {
                        FirstName = nameArray.ElementAtOrDefault(0) ?? "",
                        MiddleName = nameArray.Length >= 3 ? string.Join(" ", nameArray[1..^1]) : null,
                        LastName = nameArray.Length >= 2 ? nameArray[^1] : null,
                    }
                };
                var newUser = await repository.SaveUser(user);

                UserCredential credential = new()
                {
                    UserId = newUser.Id,
                    PasswordHash = hasher.HashPassword(newUser, signUpRequest.Password)
                };

                await repository.SaveUserCredential(credential);

                var tokens = await GenerateAccessAndRefreshTokenAsync(newUser);
                await transaction.CommitAsync();
                return tokens;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }


    private async Task<LogInResponse> GenerateAccessAndRefreshTokenAsync(User user)
    {

        var accessToken = tokenService.GenerateAccessToken(user);
        var refreshToken = tokenService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_config.RefreshTokenExpirationDays),
            UserId = user.Id
        };

        await repository.RevokeAllRefreshTokens(user.Id);
        await repository.SaveRefreshToken(refreshTokenEntity);

        return new LogInResponse()
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }
}
