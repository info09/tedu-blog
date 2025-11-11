using TeduBlog.Core.Domain.Content;
using TeduBlog.Core.Models.Content.Post;
using TeduBlog.Core.SeedWorks;

namespace TeduBlog.Core.Repositories;

public interface ITagRepository : IRepositoryBase<Tag, Guid>
{
    Task<TagDto> GetBySlug(string slug);
}
