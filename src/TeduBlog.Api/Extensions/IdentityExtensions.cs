using System.Security.Claims;
using TeduBlog.Core.SeedWorks.Constants;

namespace TeduBlog.Api.Extensions
{
    public static class IdentityExtensions
    {
        public static string GetSpecificClaim(this ClaimsIdentity identity, string  claimType)
        {
            var claim = identity.Claims.FirstOrDefault(x => x.Type == claimType);
            return claim != null ? claim.Value : string.Empty;
        }

        public static Guid GetUserId(this ClaimsPrincipal claimsPrincipal)
        {
            var claim = ((ClaimsIdentity)claimsPrincipal.Identity!).Claims.Single(x => x.Type == UserClaims.Id);
            return Guid.Parse(claim.Value);
        }
    }
}
