namespace StarBound.API.Models;

public class Star
{
    public int Id { get; set; }
    public int StarCatalogId { get; set; }  // Maps to frontend star ID
    public string Name { get; set; } = string.Empty;
    public string? CustomName { get; set; }  // User-given name
    public int OwnerId { get; set; }
    public decimal Price { get; set; }
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Owner { get; set; } = null!;
}
