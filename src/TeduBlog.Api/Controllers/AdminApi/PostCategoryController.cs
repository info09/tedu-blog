using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeduBlog.Core.Domain.Content;
using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Content.PostCategory;
using TeduBlog.Core.SeedWorks;
using static TeduBlog.Core.SeedWorks.Constants.Permissions;

namespace TeduBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class PostCategoryController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PostCategoryController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet("paging")]
        public async Task<ActionResult<PagedResult<PostCategoryDto>>> GetAllPaging(string? keyword, int pageIndex, int pageSize)
        {
            var result = await _unitOfWork.PostCategoryRepository.GetAllPaging(keyword, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PostCategoryDto>> GetPostCategoryById(Guid id)
        {
            var result = await _unitOfWork.PostCategoryRepository.GetByIdAsync(id);
            var data = _mapper.Map<PostCategoryDto>(result);
            return Ok(data);
        }

        [HttpGet]
        public async Task<ActionResult<List<PostCategoryDto>>> GetAll()
        {
            var result = await _unitOfWork.PostCategoryRepository.GetAllAsync();
            var data = _mapper.Map<List<PostCategoryDto>>(result);
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePostCategory([FromBody] CreateUpdatePostCategoryRequest request)
        {
            var post = _mapper.Map<CreateUpdatePostCategoryRequest, PostCategory>(request);

            _unitOfWork.PostCategoryRepository.Add(post);
            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok(result) : BadRequest();
        }

        [HttpPut]
        [Authorize(PostCategories.Edit)]
        public async Task<IActionResult> UpdatePostCategory(Guid id, [FromBody] CreateUpdatePostCategoryRequest request)
        {
            var post = await _unitOfWork.PostCategoryRepository.GetByIdAsync(id);
            if (post == null)
            {
                return NotFound();
            }
            _mapper.Map(request, post);
            await _unitOfWork.CompleteAsync();
            return Ok();
        }
        [HttpDelete]
        [Authorize(PostCategories.Delete)]
        public async Task<IActionResult> DeletePostCategory([FromQuery] Guid[] ids)
        {
            foreach (var id in ids)
            {
                var post = await _unitOfWork.PostCategoryRepository.GetByIdAsync(id);
                if (post == null)
                {
                    return NotFound();
                }
                _unitOfWork.PostCategoryRepository.Remove(post);
            }
            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok() : BadRequest();
        }
    }
}
