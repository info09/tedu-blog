using AutoMapper;
using TeduBlog.Core.Domain.Content;
using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Content.Post;
using TeduBlog.Core.Repositories;
using TeduBlog.Data.SeedWorks;

namespace TeduBlog.Data.Repositories
{
    public class SeriesRepository : RepositoryBase<Series, Guid>, ISeriesRepository
    {
        private readonly IMapper _mapper;
        public SeriesRepository(ApplicationDbContext context, IMapper mapper) : base(context)
        {
            _mapper = mapper;
        }

        public Task AddPostToSeries(Guid seriesId, Guid postId, int sortOrder)
        {
            throw new NotImplementedException();
        }

        public Task<PagedResult<SeriesInListDto>> GetAllPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
        {
            throw new NotImplementedException();
        }

        public Task<List<PostInListDto>> GetAllPostsInSeries(Guid seriesId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> IsPostInSeries(Guid seriesId, Guid postId)
        {
            throw new NotImplementedException();
        }

        public Task RemovePostToSeries(Guid seriesId, Guid postId)
        {
            throw new NotImplementedException();
        }
    }
}
