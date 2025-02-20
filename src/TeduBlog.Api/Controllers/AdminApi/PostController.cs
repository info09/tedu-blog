using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeduBlog.Api.Extensions;
using TeduBlog.Core.Domain.Content;
using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.Helpers;
using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Content.Post;
using TeduBlog.Core.SeedWorks;
using TeduBlog.Core.SeedWorks.Constants;
using static TeduBlog.Core.SeedWorks.Constants.Permissions;

namespace TeduBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;

        public PostController(IUnitOfWork unitOfWork, IMapper mapper, UserManager<AppUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
        }

        [HttpGet("paging")]
        [Authorize(Permissions.Posts.View)]
        public async Task<ActionResult<PagedResult<PostInListDto>>> GetPostsPaging(string? keyword, Guid? categoryId, int pageIndex = 1, int pageSize = 10)
        {
            var userId = User.GetUserId();
            var result = await _unitOfWork.PostRepository.GetAllPaging(keyword, userId, categoryId, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Permissions.Posts.View)]
        public async Task<ActionResult<PostDto>> GetPostById(Guid id)
        {
            var post = await _unitOfWork.PostRepository.GetByIdAsync(id);
            if (post == null)
                return NotFound();

            return Ok(post);
        }

        [HttpPost]
        [Authorize(Permissions.Posts.Create)]
        public async Task<IActionResult> CreatePost([FromBody] CreateUpdatePostRequest request)
        {
            if (await _unitOfWork.PostRepository.IsSlugAlreadyExisted(request.Slug))
                return BadRequest("Đã tồn tại Slug");
            var post = _mapper.Map<CreateUpdatePostRequest, Post>(request);
            var postId = Guid.NewGuid();
            var category = await _unitOfWork.PostCategoryRepository.GetByIdAsync(request.CategoryId);
            post.Id = postId;
            post.CategoryName = category!.Name;
            post.CategorySlug = category!.Slug;

            var userId = User.GetUserId();
            var user = await _userManager.FindByIdAsync(userId.ToString());
            post.AuthorUserId = userId;
            post.AuthorName = user!.GetFullName();
            post.AuthorUserName = user.UserName!;

            // Process tag
            if (request.Tags != null && request.Tags.Any())
            {
                foreach (var tagName in request.Tags)
                {
                    var tagSlug = TextHelper.ToUnsignedString(tagName);
                    var tag = await _unitOfWork.TagRepository.GetBySlug(tagSlug);
                    Guid tagId;
                    if (tag == null)
                    {
                        tagId = Guid.NewGuid();
                        _unitOfWork.TagRepository.Add(new Tag() { Id = tagId, Name = tagName, Slug = tagSlug});
                    }
                    else
                    {
                        tagId = tag.Id;
                    }
                    await _unitOfWork.PostRepository.AddTagToPost(postId, tagId);
                }
            }

            _unitOfWork.PostRepository.Add(post);

            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok() : BadRequest();
        }

        [HttpPut("{id}")]
        [Authorize(Permissions.Posts.Edit)]
        public async Task<IActionResult> UpdatePost(Guid id, [FromBody] CreateUpdatePostRequest request)
        {
            if (await _unitOfWork.PostRepository.IsSlugAlreadyExisted(request.Slug, id))
                return BadRequest("Đã tồn tại slug");

            var post = await _unitOfWork.PostRepository.GetByIdAsync(id);
            if (post == null)
                return NotFound();

            if (post.CategoryId != request.CategoryId)
            {
                var category = await _unitOfWork.PostCategoryRepository.GetByIdAsync(request.CategoryId);
                post.CategoryName = category!.Name;
                post.CategorySlug = category!.Slug;
            }

            _mapper.Map(request, post);

            // Process tag
            if (request.Tags != null && request.Tags.Any())
            {
                foreach (var tagName in request.Tags)
                {
                    var tagSlug = TextHelper.ToUnsignedString(tagName);
                    var tag = await _unitOfWork.TagRepository.GetBySlug(tagSlug);
                    Guid tagId;
                    if (tag == null)
                    {
                        tagId = Guid.NewGuid();
                        _unitOfWork.TagRepository.Add(new Tag() { Id = tagId, Name = tagName, Slug = tagSlug });
                    }
                    else
                    {
                        tagId = tag.Id;
                    }
                    await _unitOfWork.PostRepository.AddTagToPost(post.Id, tagId);
                }
            }

            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok() : BadRequest();
        }

        [HttpDelete]
        [Authorize(Permissions.Posts.Delete)]
        public async Task<IActionResult> DeletePosts([FromQuery] Guid[] ids)
        {
            foreach (var id in ids)
            {
                var post = await _unitOfWork.PostRepository.GetByIdAsync(id);
                if (post == null)
                    return NotFound();
                _unitOfWork.PostRepository.Remove(post);
            }
            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok() : BadRequest();
        }

        [HttpGet("series-belong/{postId}")]
        [Authorize(Permissions.Posts.View)]
        public async Task<ActionResult<List<SeriesInListDto>>> GetSeriesBelong(Guid postId)
        {
            var result = await _unitOfWork.PostRepository.GetAllSeries(postId);
            return Ok(result);
        }

        [HttpGet("approve/{id}")]
        [Authorize(Permissions.Posts.Approve)]
        public async Task<IActionResult> ApprovePost(Guid id)
        {
            await _unitOfWork.PostRepository.Approve(id, User.GetUserId());
            await _unitOfWork.CompleteAsync();
            return Ok();
        }

        [HttpGet("approval-submit/{id}")]
        [Authorize(Posts.Edit)]
        public async Task<IActionResult> SendToApprove(Guid id)
        {
            await _unitOfWork.PostRepository.SendToApprove(id, User.GetUserId());
            await _unitOfWork.CompleteAsync();
            return Ok();
        }

        [HttpPost("return-back/{id}")]
        [Authorize(Posts.Approve)]
        public async Task<IActionResult> ReturnBack(Guid id, [FromBody] ReturnBackRequest model)
        {
            await _unitOfWork.PostRepository.ReturnBack(id, User.GetUserId(), model.Reason);
            await _unitOfWork.CompleteAsync();
            return Ok();
        }

        [HttpGet("return-reason/{id}")]
        [Authorize(Posts.Approve)]
        public async Task<ActionResult<string>> GetReason(Guid id)
        {
            var note = await _unitOfWork.PostRepository.GetReturnReason(id);
            return Ok(note);
        }

        [HttpGet("activity-logs/{id}")]
        [Authorize(Posts.Approve)]
        public async Task<ActionResult<List<PostActivityLogDto>>> GetActivityLogs(Guid id)
        {
            var logs = await _unitOfWork.PostRepository.GetActivityLogs(id);
            return Ok(logs);
        }

        [HttpGet("tags")]
        [Authorize(Posts.View)]
        public async Task<ActionResult<List<string>>> GetAllTags()
        {
            var tags = await _unitOfWork.PostRepository.GetAllTags();
            return Ok(tags);
        }

        [HttpGet("tags/{postId}")]
        [Authorize(Posts.View)]
        public async Task<ActionResult<List<string>>> GetPostTags(Guid postId)
        {
            var tags = await _unitOfWork.PostRepository.GetTagByPostId(postId);
            return Ok(tags);
        }
    }
}
