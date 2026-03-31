using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildOps.API.Features.Authentication.Models;

public class RefreshToken
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    [MaxLength(200)]
    public string Token { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow;

    public DateTime? RevokedAt { get; set; }

    public bool IsValid => RevokedAt == null && DateTime.UtcNow.AddSeconds(-30) < ExpiresAt;

    //Navigation Properties
    public User User { get; set; } = null!;
}
