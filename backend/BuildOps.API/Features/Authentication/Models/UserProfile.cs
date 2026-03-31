using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildOps.API.Features.Authentication.Models;

public class UserProfile
{
    [Key]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = null!;

    [MaxLength(50)]
    public string? MiddleName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    public DateTime? ModifiedOn { get; set; }

    // Navigation Property
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
