using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeduBlog.Api.Services;
using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.Models.Auth;

namespace TeduBlog.Api.Controllers.AdminApi
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;

        public TokenController(UserManager<AppUser> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthenticatedResult>> Refresh([FromBody] TokenRequest request)
        {
            if (request == null)
                return BadRequest("Invalid request");

            string accessToken = request.AccessToken;
            string refreshToken = request.RefreshToken;
            var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);

            if (principal == null || principal.Identity == null || principal.Identity.Name == null)
                return BadRequest("Invalid token");

            var userName = principal.Identity.Name;
            var user = await _userManager.FindByNameAsync(userName);

            if (user is null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
                return BadRequest("Invalid client request");

            var newAccessToken = _tokenService.GenerateAccessToken(principal.Claims);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;

            await _userManager.UpdateAsync(user);

            return Ok(new AuthenticatedResult()
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }
    }
}
