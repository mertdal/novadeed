using Google.Apis.Auth;

namespace StarBound.API.Services;

public class GoogleAuthService
{
    private readonly IConfiguration _config;

    public GoogleAuthService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<GoogleJsonWebSignature.Payload?> ValidateGoogleToken(string idToken)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _config["Google:ClientId"] ?? "" }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            return payload;
        }
        catch (InvalidJwtException)
        {
            return null;
        }
    }
}
