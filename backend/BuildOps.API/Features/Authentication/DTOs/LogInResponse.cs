namespace BuildOps.API.Features.Authentication.DTOs;

public class LogInResponse
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;
}
