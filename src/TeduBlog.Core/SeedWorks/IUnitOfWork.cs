using TeduBlog.Core.Repositories;

namespace TeduBlog.Core.SeedWorks
{
    public interface IUnitOfWork
    {
        IPostRepository PostRepository { get; }
        IPostCategoryRepository PostCategoryRepository { get; }
        ISeriesRepository SeriesRepository { get; }
        ITransactionRepository TransactionRepository { get; }
        IUserRepository UserRepository { get; }
        ITagRepository TagRepository { get; }
        Task<int> CompleteAsync();
    }
}
