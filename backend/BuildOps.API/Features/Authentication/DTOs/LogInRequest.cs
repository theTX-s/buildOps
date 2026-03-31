using System.ComponentModel.DataAnnotations;

namespace BuildOps.API.Features.Authentication.DTOs;

public class LogInRequest
{
    [Required]
    public string EmailId { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;
}
