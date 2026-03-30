using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildOps.API.Features.Authentication.Models;

public class UserCredential
{
    [Key]
    [ForeignKey("User")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string PasswordHash { get; set; } = null!;

    public DateTime ModifiedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
