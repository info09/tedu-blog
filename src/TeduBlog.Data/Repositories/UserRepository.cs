using Microsoft.EntityFrameworkCore;
using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.Repositories;
using TeduBlog.Data.SeedWorks;

namespace TeduBlog.Data.Repositories
{
    public class UserRepository : RepositoryBase<AppUser, Guid>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task RemoveUserFromRoles(Guid userId, string[] roleNames)
        {
            if (roleNames == null || roleNames.Length == 0) return;

            foreach (string roleName in roleNames)
            {
                var role = await _context.Roles.FirstOrDefaultAsync(i => i.Name == roleName);
                if (role == null) return;

                var userRole = await _context.UserRoles.FirstOrDefaultAsync(i => i.RoleId == role.Id && i.UserId == userId);
                if (userRole == null) return;

                _context.UserRoles.Remove(userRole);
            }
        }
    }
}
