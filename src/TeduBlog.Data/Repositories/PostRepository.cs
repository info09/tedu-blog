using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeduBlog.Core.Domain.Content;
using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Content.Post;
using TeduBlog.Core.Repositories;
using TeduBlog.Core.SeedWorks.Constants;
using TeduBlog.Data.SeedWorks;

namespace TeduBlog.Data.Repositories
{
    public class PostRepository : RepositoryBase<Post, Guid>, IPostRepository
    {
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        public PostRepository(ApplicationDbContext context, IMapper mapper, UserManager<AppUser> userManager) : base(context)
        {
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task Approve(Guid id, Guid currentUserId)
        {
            var post = await _context.Posts.FindAsync(id) ?? throw new Exception("Không tồn tại bài viết");
            var user = await _userManager.FindByIdAsync(currentUserId.ToString());
            await _context.PostActivityLogs.AddAsync(new PostActivityLog
            {
                Id = Guid.NewGuid(),
                FromStatus = post.Status,
                ToStatus = PostStatus.Published,
                UserId = currentUserId,
                UserName = user?.UserName!,
                PostId = post.Id,
                Note = $"{user?.UserName} duyệt bài"
            });
            post.Status = PostStatus.Published;
            _context.Posts.Update(post);
        }

        public async Task<List<PostActivityLogDto>> GetActivityLogs(Guid id)
        {
            var query = _context.PostActivityLogs.Where(i => i.PostId == id).OrderByDescending(i => i.DateCreated);
            return await _mapper.ProjectTo<PostActivityLogDto>(query).ToListAsync();
        }

        public async Task<PagedResult<PostInListDto>> GetAllPaging(string? keyword, Guid currentUserId, Guid? categoryId, int pageIndex = 1, int pageSize = 10)
        {
            var user = await _userManager.FindByIdAsync(currentUserId.ToString()) ?? throw new Exception("User không tồn tại");
            var roles = await _userManager.GetRolesAsync(user);
            var canApprove = false;
            if (roles.Contains(Roles.Admin))
            {
                canApprove = true;
            }
            else
            {
                canApprove = await _context.RoleClaims.AnyAsync(i => roles.Contains(i.RoleId.ToString()) && i.ClaimValue == Permissions.Posts.Approve);
            }
            var query = _context.Posts.AsQueryable();
            query = !string.IsNullOrEmpty(keyword) ? query.Where(i => i.Name.ToLower().Contains(keyword.ToLower())) : query;
            query = categoryId.HasValue ? query.Where(i => i.CategoryId.ToString() == categoryId.ToString()) : query;
            query = !canApprove ? query.Where(i => i.AuthorUserId == currentUserId) : query;

            var totalRow = await query.CountAsync();
            query = query.OrderByDescending(i => i.DateCreated).Skip((pageIndex - 1) * pageSize).Take(pageSize);
            return new PagedResult<PostInListDto>
            {
                Items = await _mapper.ProjectTo<PostInListDto>(query).ToListAsync(),
                RowCount = totalRow,
                CurrentPage = pageIndex,
                PageSize = pageSize,
            };
        }

        public async Task<List<SeriesInListDto>> GetAllSeries(Guid postId)
        {
            var query = (from pis in _context.PostInSeries
                         join s in _context.Series on pis.SeriesId equals s.Id
                         where pis.PostId == postId
                         select s);
            return await _mapper.ProjectTo<SeriesInListDto>(query).ToListAsync();
        }

        public async Task<string> GetReturnReason(Guid id)
        {
            var activity = await _context.PostActivityLogs.Where(i => i.PostId == id && i.ToStatus == PostStatus.Rejected)
                                                                        .OrderByDescending(i => i.DateCreated)
                                                                        .FirstOrDefaultAsync();
            return activity?.Note!;
        }

        public async Task<bool> HasPublishInLast(Guid id)
        {
            var hasPublished = await _context.PostActivityLogs.CountAsync(i => i.PostId == id && i.ToStatus == PostStatus.Published);
            return hasPublished > 0;
        }

        public Task<bool> IsSlugAlreadyExisted(string slug, Guid? currentId = null)
        {
            if (currentId.HasValue)
            {
                return _context.Posts.AnyAsync(x => x.Slug == slug && x.Id != currentId.Value);
            }
            return _context.Posts.AnyAsync(x => x.Slug == slug);
        }

        public async Task ReturnBack(Guid id, Guid currentUserId, string note)
        {
            var post = await _context.Posts.FindAsync(id) ?? throw new Exception("Không tồn tại bài viết");
            var user = await _userManager.FindByIdAsync(currentUserId.ToString());
            await _context.PostActivityLogs.AddAsync(new PostActivityLog
            {
                FromStatus = post.Status,
                ToStatus = PostStatus.Rejected,
                UserId = currentUserId,
                UserName = user?.UserName!,
                PostId = post.Id,
                Note = note
            });

            post.Status = PostStatus.Rejected;
            _context.Posts.Update(post);
        }

        public async Task SendToApprove(Guid id, Guid currentUserId)
        {
            var post = await _context.Posts.FindAsync(id) ?? throw new Exception("Không tồn tại bài viết");
            var user = await _userManager.FindByIdAsync(currentUserId.ToString()) ?? throw new Exception("Không tồn tại user");
            await _context.PostActivityLogs.AddAsync(new PostActivityLog
            {
                FromStatus = post.Status,
                ToStatus = PostStatus.WaitingForApproval,
                UserId = currentUserId,
                PostId = post.Id,
                UserName = user?.UserName!,
                Note = $"{user?.UserName} gửi bài chờ duyệt"
            });

            post.Status = PostStatus.WaitingForApproval;
            _context.Posts.Update(post);
        }
    }
}
