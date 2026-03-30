using System.ComponentModel.DataAnnotations;

namespace BuildOps.API.Features.Authentication.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string EmailId { get; set; } = null!;

    [MaxLength(20)]
    public string PhoneNumber { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DeletedAt { get; set; }

    //Navigation Properties
    public UserProfile Profile { get; set; } = null!;
}
