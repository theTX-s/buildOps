using BuildOps.API.Data;
using BuildOps.API.Features.Authentication.Interfaces.Repository;
using BuildOps.API.Features.Authentication.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace BuildOps.API.Features.Authentication.Repository;

public class AuthRepository(AppDbContext dbContext) : IAuthRepository
{
    public async Task<User?> GetUserByEmailId(string emailId)
    {
        return await dbContext.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.EmailId == emailId);
    }

    public async Task<UserCredential?> GetUserCredentialByUserId(Guid userId)
    {
        return await dbContext.UserCredentials.FirstOrDefaultAsync(u => u.UserId == userId);
    }

    public async Task<User> SaveUser(User user)
    {
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();
        return user;
    }

    public async Task<bool> UserExists(string emailId, string phoneNumber)
    {
        return await dbContext.Users.AnyAsync(u => u.EmailId == emailId || u.PhoneNumber == phoneNumber);
    }

    public async Task SaveUserCredential(UserCredential credential)
    {
        await dbContext.UserCredentials.AddAsync(credential);
        await dbContext.SaveChangesAsync();
    }

    public async Task SaveUserProfile(UserProfile userProfile)
    {
        await dbContext.UserProfiles.AddAsync(userProfile);
        await dbContext.SaveChangesAsync();
    }

    public async Task SaveRefreshToken(RefreshToken refreshToken)
    {
        await dbContext.RefreshTokens.AddAsync(refreshToken);
        await dbContext.SaveChangesAsync();
    }

    public async Task RevokeAllRefreshTokens(Guid userId)
    {
        await dbContext.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, DateTime.UtcNow));
    }
    public IExecutionStrategy CreateExecutionStrategy()
    {
        return dbContext.Database.CreateExecutionStrategy();
    }

    public async Task<IDbContextTransaction> BeginTransationAsync()
    {
        return await dbContext.Database.BeginTransactionAsync();
    }
}
