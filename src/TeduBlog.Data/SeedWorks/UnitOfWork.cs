using AutoMapper;
using TeduBlog.Core.Repositories;
using TeduBlog.Core.SeedWorks;
using TeduBlog.Data.Repositories;

namespace TeduBlog.Data.SeedWorks
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public UnitOfWork(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            PostRepository = new PostRepository(context, mapper);
            PostCategoryRepository = new PostCategoryRepository(context, mapper);
        }

        public IPostRepository PostRepository { get; private set; }
        public IPostCategoryRepository PostCategoryRepository { get; private set; }

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
