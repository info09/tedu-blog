using TeduBlog.Core.Repositories;

namespace TeduBlog.Core.SeedWorks
{
    public interface IUnitOfWork
    {
        IPostRepository PostRepository { get; }
        Task<int> CompleteAsync();
    }
}
