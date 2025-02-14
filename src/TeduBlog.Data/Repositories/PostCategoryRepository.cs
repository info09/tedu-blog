﻿using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TeduBlog.Core.Domain.Content;
using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Content.PostCategory;
using TeduBlog.Core.Repositories;
using TeduBlog.Data.SeedWorks;

namespace TeduBlog.Data.Repositories
{
    public class PostCategoryRepository : RepositoryBase<PostCategory, Guid>, IPostCategoryRepository
    {
        private readonly IMapper _mapper;
        public PostCategoryRepository(ApplicationDbContext context, IMapper mapper) : base(context)
        {
            _mapper = mapper;
        }

        public async Task<PagedResult<PostCategoryDto>> GetAllPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
        {
            var query = _context.PostCategories.AsQueryable();
            query = !string.IsNullOrEmpty(keyword) ? query.Where(i => i.Name.ToLower().Contains(keyword.ToLower())) : query;
            var totalRow = await query.CountAsync();
            query = query.OrderByDescending(i => i.DateCreated).Skip((pageIndex - 1) * pageSize).Take(pageSize);

            return new PagedResult<PostCategoryDto>
            {
                Items = await _mapper.ProjectTo<PostCategoryDto>(query).ToListAsync(),
                RowCount = totalRow,
                CurrentPage = pageIndex,
                PageSize = pageSize
            };
        }
    }
}
