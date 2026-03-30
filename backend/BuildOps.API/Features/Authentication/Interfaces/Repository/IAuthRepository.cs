using BuildOps.API.Features.Authentication.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace BuildOps.API.Features.Authentication.Interfaces.Repository;

public interface IAuthRepository
{
    Task<User?> GetUserByEmailId(string emailId);

    Task<UserCredential?> GetUserCredentialByUserId(Guid userId);

    Task<bool> UserExists(string emailId, string phoneNumber);

    Task<User> SaveUser(User user);

    Task SaveUserProfile(UserProfile userProfile);

    Task SaveRefreshToken(RefreshToken refreshToken);

    Task SaveUserCredential(UserCredential userCredential);

    Task RevokeAllRefreshTokens(Guid userId);

    IExecutionStrategy CreateExecutionStrategy();

    Task<IDbContextTransaction> BeginTransationAsync();
}
