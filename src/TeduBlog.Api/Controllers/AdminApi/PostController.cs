﻿using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TeduBlog.Core.Domain.Content;
using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Content;
using TeduBlog.Core.SeedWorks;

namespace TeduBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PostController(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet("paging")]
        public async Task<ActionResult<PagedResult<PostInListDto>>> GetPostsPaging(string? keyword, Guid? categoryId, int pageIndex = 1, int pageSize = 10)
        {
            var result = await _unitOfWork.PostRepository.GetPostsPagingAsync(keyword, categoryId, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PostDto>> GetPostById(Guid id)
        {
            var post = await _unitOfWork.PostRepository.GetByIdAsync(id);
            if (post == null)
                return NotFound();

            return Ok(post);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreateUpdatePostRequest request)
        {
            var post = _mapper.Map<CreateUpdatePostRequest, Post>(request);
            _unitOfWork.PostRepository.Add(post);

            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok() : BadRequest();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(Guid id, [FromBody] CreateUpdatePostRequest request)
        {
            var post = await _unitOfWork.PostRepository.GetByIdAsync(id);
            if (post == null)
                return NotFound();

            _mapper.Map(request, post);
            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok() : BadRequest();
        }

        [HttpDelete]
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
    }
}
