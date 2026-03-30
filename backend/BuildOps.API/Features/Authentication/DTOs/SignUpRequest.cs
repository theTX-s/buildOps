using System.ComponentModel.DataAnnotations;

namespace BuildOps.API.Features.Authentication.DTOs;

public class SignUpRequest : LogInRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;
}
