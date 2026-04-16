using System.ComponentModel.DataAnnotations;

namespace StarBound.API.Models.DTOs;

// ── Auth DTOs ──

public class RegisterRequest
{
    [Required, MinLength(2)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class GoogleLoginRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── Star DTOs ──

public class PurchaseStarRequest
{
    [Required]
    public int StarCatalogId { get; set; }

    [Required]
    public string StarName { get; set; } = string.Empty;

    public string? CustomName { get; set; }

    [Required]
    public decimal Price { get; set; }
}

public class StarDto
{
    public int Id { get; set; }
    public int StarCatalogId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CustomName { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public DateTime PurchasedAt { get; set; }
}
