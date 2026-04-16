using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StarBound.API.Data;
using StarBound.API.Models;
using StarBound.API.Models.DTOs;
using System.Security.Claims;

namespace StarBound.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StarsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StarsController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    /// <summary>
    /// Get all stars owned by the current user
    /// </summary>
    [HttpGet("owned")]
    public async Task<ActionResult<List<StarDto>>> GetOwnedStars()
    {
        var userId = GetUserId();

        var stars = await _db.Stars
            .Where(s => s.OwnerId == userId)
            .Include(s => s.Owner)
            .OrderByDescending(s => s.PurchasedAt)
            .Select(s => new StarDto
            {
                Id = s.Id,
                StarCatalogId = s.StarCatalogId,
                Name = s.Name,
                CustomName = s.CustomName,
                OwnerName = s.Owner.Name,
                Price = s.Price,
                PurchasedAt = s.PurchasedAt,
            })
            .ToListAsync();

        return Ok(stars);
    }

    /// <summary>
    /// Get all owned stars (public — no auth required)
    /// </summary>
    [HttpGet("all-owned")]
    [AllowAnonymous]
    public async Task<ActionResult<List<StarDto>>> GetAllOwnedStars()
    {
        var stars = await _db.Stars
            .Include(s => s.Owner)
            .OrderByDescending(s => s.PurchasedAt)
            .Select(s => new StarDto
            {
                Id = s.Id,
                StarCatalogId = s.StarCatalogId,
                Name = s.Name,
                CustomName = s.CustomName,
                OwnerName = s.Owner.Name,
                Price = s.Price,
                PurchasedAt = s.PurchasedAt,
            })
            .ToListAsync();

        return Ok(stars);
    }

    /// <summary>
    /// Purchase/claim a star
    /// </summary>
    [HttpPost("purchase")]
    public async Task<ActionResult<StarDto>> PurchaseStar([FromBody] PurchaseStarRequest req)
    {
        var userId = GetUserId();

        // Check if star is already owned
        var existing = await _db.Stars.FirstOrDefaultAsync(s => s.StarCatalogId == req.StarCatalogId);
        if (existing != null)
            return Conflict(new { message = "This star is already owned by someone" });

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return Unauthorized();

        var star = new Star
        {
            StarCatalogId = req.StarCatalogId,
            Name = req.StarName,
            CustomName = req.CustomName,
            OwnerId = userId,
            Price = req.Price,
            PurchasedAt = DateTime.UtcNow,
        };

        _db.Stars.Add(star);
        await _db.SaveChangesAsync();

        return Ok(new StarDto
        {
            Id = star.Id,
            StarCatalogId = star.StarCatalogId,
            Name = star.Name,
            CustomName = star.CustomName,
            OwnerName = user.Name,
            Price = star.Price,
            PurchasedAt = star.PurchasedAt,
        });
    }
}
