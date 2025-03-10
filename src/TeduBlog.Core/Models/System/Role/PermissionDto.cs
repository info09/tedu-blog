namespace TeduBlog.Core.Models.System.Role
{
    public class PermissionDto
    {
        public string RoleId { get; set; } = default!;
        public IList<RoleClaimsDto> RoleClaims { get; set; } = [];
    }
}
