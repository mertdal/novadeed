using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StarBound.API.Data;
using StarBound.API.Models;
using StarBound.API.Models.DTOs;
using StarBound.API.Services;

namespace StarBound.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuthService _auth;
    private readonly GoogleAuthService _google;

    public AuthController(AppDbContext db, AuthService auth, GoogleAuthService google)
    {
        _db = db;
        _auth = auth;
        _google = google;
    }

    /// <summary>
    /// Register with email and password
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        // Check if email exists
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already registered" });

        var user = new User
        {
            Name = req.Name,
            Email = req.Email.ToLower().Trim(),
            PasswordHash = _auth.HashPassword(req.Password),
            CreatedAt = DateTime.UtcNow,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _auth.GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = MapUserDto(user),
        });
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLower().Trim());

        if (user == null || user.PasswordHash == null)
            return Unauthorized(new { message = "Invalid email or password" });

        if (!_auth.VerifyPassword(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        var token = _auth.GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = MapUserDto(user),
        });
    }

    /// <summary>
    /// Login/Register with Google OAuth
    /// </summary>
    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin([FromBody] GoogleLoginRequest req)
    {
        var payload = await _google.ValidateGoogleToken(req.IdToken);

        if (payload == null)
            return Unauthorized(new { message = "Invalid Google token" });

        // Find or create user
        var user = await _db.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Subject);

        if (user == null)
        {
            // Check if email already exists (link accounts)
            user = await _db.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

            if (user != null)
            {
                // Link Google to existing account
                user.GoogleId = payload.Subject;
                user.Avatar = payload.Picture;
            }
            else
            {
                // Create new user
                user = new User
                {
                    Name = payload.Name ?? payload.Email ?? "Explorer",
                    Email = payload.Email ?? "",
                    GoogleId = payload.Subject,
                    Avatar = payload.Picture,
                    CreatedAt = DateTime.UtcNow,
                };
                _db.Users.Add(user);
            }

            await _db.SaveChangesAsync();
        }

        var token = _auth.GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = MapUserDto(user),
        });
    }

    /// <summary>
    /// Get current authenticated user info
    /// </summary>
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _db.Users.FindAsync(userId);

        if (user == null)
            return NotFound();

        return Ok(MapUserDto(user));
    }

    private static UserDto MapUserDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Avatar = user.Avatar,
        CreatedAt = user.CreatedAt,
    };
}
