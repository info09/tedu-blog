using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.SeedWorks;

namespace TeduBlog.Core.Repositories
{
    public interface IUserRepository : IRepositoryBase<AppUser, Guid>
    {
        Task RemoveUserFromRoles(Guid userId, string[] roleNames);
    }
}
