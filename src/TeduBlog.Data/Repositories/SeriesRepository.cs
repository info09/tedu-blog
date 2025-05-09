using AutoMapper;

using Microsoft.EntityFrameworkCore;

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

        public async Task AddPostToSeries(Guid seriesId, Guid postId, int sortOrder)
        {
            var postInSeries = await _context.PostInSeries.FirstOrDefaultAsync(i => i.PostId == postId && i.SeriesId == seriesId);
            if (postInSeries == null)
            {
                await _context.PostInSeries.AddAsync(new PostInSeries
                {
                    SeriesId = seriesId,
                    PostId = postId,
                    DisplayOrder = sortOrder
                });
            }
        }

        public async Task<PagedResult<SeriesInListDto>> GetAllPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
        {
            var query = _context.Series.AsQueryable();
            query = !string.IsNullOrEmpty(keyword) ? query.Where(i => i.Name.ToLower().Contains(keyword.ToLower())) : query;
            var totalRow = await query.CountAsync();
            query = query.OrderByDescending(i => i.DateCreated).Skip((pageIndex - 1) * pageSize).Take(pageSize);
            return new PagedResult<SeriesInListDto>
            {
                Items = await _mapper.ProjectTo<SeriesInListDto>(query).ToListAsync(),
                RowCount = totalRow,
                PageSize = pageSize,
                CurrentPage = pageIndex
            };
        }

        public async Task<List<PostInListDto>> GetAllPostsInSeries(Guid seriesId)
        {
            var query = from pis in _context.PostInSeries
                        join p in _context.Posts on pis.PostId equals p.Id
                        where pis.SeriesId == seriesId
                        select p;
            return await _mapper.ProjectTo<PostInListDto>(query).ToListAsync();
        }

        public async Task<PagedResult<PostInListDto>> GetAllPostsInSeries(string slug, int pageIndex = 1, int pageSize = 10)
        {
            var query = from pis in _context.PostInSeries
                        join p in _context.Posts on pis.PostId equals p.Id
                        join s in _context.Series on pis.SeriesId equals s.Id
                        where s.Slug == slug
                        select p;

            var totalRow = await query.CountAsync();
            query = query.OrderByDescending(i => i.DateCreated).Skip((pageIndex - 1) * pageSize).Take(pageSize);
            return new PagedResult<PostInListDto>
            {
                Items = await _mapper.ProjectTo<PostInListDto>(query).ToListAsync(),
                RowCount = totalRow,
                PageSize = pageSize,
                CurrentPage = pageIndex
            };
        }

        public async Task<SeriesDto> GetBySlug(string slug)
        {
            var series = await _context.Series.FirstOrDefaultAsync(i => i.Slug == slug);
            return _mapper.Map<SeriesDto>(series);
        }

        public async Task<bool> HasPost(Guid seriesId)
        {
            return await _context.PostInSeries.AnyAsync(i => i.SeriesId == seriesId);
        }

        public async Task<bool> IsPostInSeries(Guid seriesId, Guid postId)
        {
            return await _context.PostInSeries.AnyAsync(i => i.SeriesId == seriesId && i.PostId == postId);
        }

        public async Task RemovePostToSeries(Guid seriesId, Guid postId)
        {
            var postInSeries = await _context.PostInSeries.FirstOrDefaultAsync(i => i.PostId == postId && i.SeriesId == seriesId);
            if (postInSeries != null)
            {
                _context.PostInSeries.Remove(postInSeries);
            }
        }
    }
}
