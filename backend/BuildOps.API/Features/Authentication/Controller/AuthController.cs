using BuildOps.API.Features.Authentication.DTOs;
using BuildOps.API.Features.Authentication.Interfaces.Handler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BuildOps.API.Features.Authentication.Controller;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthHandler handler) : ControllerBase
{
    [HttpGet("test")]
    public IActionResult TestToken()
    {
        return Ok();
    }

    [HttpPost("logIn")]
    [AllowAnonymous]
    public async Task<IActionResult> LogIn(LogInRequest logInRequest)
    {
        var logInResponse = await handler.LogInAsync(logInRequest);
        if (logInResponse == null)
        {
            return Unauthorized(new { message = "Invalid emailId or password" });
        }
        SetRefreshTokenCookie(logInResponse.RefreshToken);
        return Ok(logInResponse.AccessToken);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = Request.Cookies });
        }

        var logInResponse = await handler.RefreshToken(refreshToken);
        if (logInResponse == null)
        {
            return Unauthorized(new { message = "Invalid Token" });
        }
        SetRefreshTokenCookie(logInResponse.RefreshToken);
        return Ok(logInResponse.AccessToken);
    }

    [HttpPost("signUp")]
    [AllowAnonymous]
    public async Task<IActionResult> SignUp(SignUpRequest signUpRequest)
    {
        var logInResponse = await handler.SignUpAsync(signUpRequest);
        if (logInResponse == null)
        {
            return Conflict(new { message = "Phone number or emailId already exists" });
        }
        SetRefreshTokenCookie(logInResponse.RefreshToken);
        return Ok(logInResponse.AccessToken);
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7),
            Path = "/api/auth/refresh"
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
