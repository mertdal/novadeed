using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StarBound.API.Data;
using StarBound.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=starbound.db")
);

// ── Services ──
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<GoogleAuthService>();

// ── JWT Authentication ──
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "StarBound_SuperSecret_Key_2026_!@#$%^&*()_ChangeInProduction";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "StarBound.API",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "StarBound.Frontend",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]?.Split(',') 
                             ?? new[] { "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000" };

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ── Controllers ──
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ── Migrate database on startup ──
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// ── Middleware pipeline ──
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🚀 StarBound API running on http://localhost:5000");
app.Run();
