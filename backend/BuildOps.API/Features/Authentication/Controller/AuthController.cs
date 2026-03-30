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
        return Ok(logInResponse);
    }

    [HttpPost("signUp")]
    [AllowAnonymous]
    public async Task<IActionResult> SignUp(SignUpRequest signUpRequest)
    {
        var logInReponse = await handler.SignUpAsync(signUpRequest);
        if (logInReponse == null)
        {
            return Conflict(new { message = "Phone number or emailId already exists" });
        }
        return Ok(logInReponse);
    }
}
