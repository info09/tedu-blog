using AutoMapper;
using Microsoft.AspNetCore.Identity;
using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.Repositories;
using TeduBlog.Core.SeedWorks;
using TeduBlog.Data.Repositories;

namespace TeduBlog.Data.SeedWorks
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public UnitOfWork(ApplicationDbContext context, IMapper mapper, UserManager<AppUser> userManager)
        {
            _context = context;
            PostRepository = new PostRepository(context, mapper, userManager);
            PostCategoryRepository = new PostCategoryRepository(context, mapper);
            SeriesRepository = new SeriesRepository(context, mapper);
            TransactionRepository = new TransactionRepository(context, mapper);
            UserRepository = new UserRepository(context);
        }

        public IPostRepository PostRepository { get; private set; }
        public IPostCategoryRepository PostCategoryRepository { get; private set; }

        public ISeriesRepository SeriesRepository { get; private set; }

        public ITransactionRepository TransactionRepository { get; private set; }

        public IUserRepository UserRepository { get; private set; }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
