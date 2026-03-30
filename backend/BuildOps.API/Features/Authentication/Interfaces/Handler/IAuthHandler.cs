
using BuildOps.API.Features.Authentication.DTOs;

namespace BuildOps.API.Features.Authentication.Interfaces.Handler;

public interface IAuthHandler
{
    Task<LogInResponse?> LogInAsync(LogInRequest logInRequest);

    Task<LogInResponse?> SignUpAsync(SignUpRequest signUpRequest);
}
