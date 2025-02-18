using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TeduBlog.Core.Domain.Royalty;
using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Royalty;
using TeduBlog.Core.Repositories;
using TeduBlog.Data.SeedWorks;

namespace TeduBlog.Data.Repositories
{
    public class TransactionRepository : RepositoryBase<Transaction, Guid>, ITransactionRepository
    {
        private readonly IMapper _mapper;
        public TransactionRepository(ApplicationDbContext context, IMapper mapper) : base(context)
        {
            _mapper = mapper;
        }

        public async Task<PagedResult<TransactionDto>> GetAllPaging(string? userName, int fromMonth, int fromYear, int toMonth, int toYear, int pageIndex = 1, int pageSize = 10)
        {
            var query = _context.Transactions.AsQueryable();
            query = !string.IsNullOrWhiteSpace(userName) ? query.Where(i => i.ToUserName.Contains(userName)) : query;
            query = (fromMonth > 0 && fromYear > 0) ? query.Where(i => i.DateCreated.Date.Month >= fromMonth && i.DateCreated.Date.Year >= fromYear) : query;
            query = (toMonth > 0 && toYear > 0) ? query.Where(i => i.DateCreated.Date.Month <= toMonth && i.DateCreated.Date.Year <= toYear) : query;

            var totalRow = await query.CountAsync();
            query = query.OrderByDescending(i => i.DateCreated).Skip((pageIndex - 1) * pageSize).Take(pageSize);

            return new PagedResult<TransactionDto>
            {
                Items = await _mapper.ProjectTo<TransactionDto>(query).ToListAsync(),
                CurrentPage = pageIndex,
                PageSize = pageSize,
                RowCount = totalRow,
            };
        }
    }
}
