namespace StarBound.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
    public string? Avatar { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Star> OwnedStars { get; set; } = new List<Star>();
}
