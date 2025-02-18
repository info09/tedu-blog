using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TeduBlog.Api.Extensions;
using TeduBlog.Core.Domain.Royalty;
using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Royalty;
using TeduBlog.Core.SeedWorks;
using TeduBlog.Core.SeedWorks.Constants;
using TeduBlog.Core.Services;
using static TeduBlog.Core.SeedWorks.Constants.Permissions;

namespace TeduBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class RoyaltyController : ControllerBase
    {
        private readonly IRoyaltyService _royaltyService;
        private readonly IUnitOfWork _unitOfWork;

        public RoyaltyController(IRoyaltyService royaltyService, IUnitOfWork unitOfWork)
        {
            _royaltyService = royaltyService;
            _unitOfWork = unitOfWork;
        }

        [HttpGet("transaction-histories")]
        [Authorize(Permissions.Royalty.View)]
        public async Task<ActionResult<PagedResult<TransactionDto>>> GetTransactionHistory(string? keyword, int fromMonth, int fromYear, int toMonth, int toYear, int pageIndex, int pageSize = 10)
        {
            var data = await _unitOfWork.TransactionRepository.GetAllPaging(keyword, fromMonth, fromYear, toMonth, toYear, pageIndex, pageSize);
            return Ok(data);
        }

        [HttpPost("{userId}")]
        [Authorize(Royalty.Pay)]
        public async Task<IActionResult> PayRoyalty(Guid userId)
        {
            var fromUserId = User.GetUserId();
            await _royaltyService.PayRoyaltyForUserAsync(fromUserId, userId);
            return Ok();
        }

        [HttpGet]
        [Route("Royalty-report-by-user")]
        [Authorize(Royalty.View)]
        public async Task<ActionResult<List<RoyaltyReportByUserDto>>> GetRoyaltyReportByUser(Guid? userId,
          int fromMonth, int fromYear, int toMonth, int toYear)
        {
            var result = await _royaltyService.GetRoyaltyReportByUserAsync(userId, fromMonth, fromYear, toMonth, toYear);
            return Ok(result);
        }
        [HttpGet]
        [Route("Royalty-report-by-month")]
        [Authorize(Royalty.View)]
        public async Task<ActionResult<List<RoyaltyReportByMonthDto>>> GetRoyaltyReportByMonth(Guid? userId,
         int fromMonth, int fromYear, int toMonth, int toYear)
        {
            var result = await _royaltyService.GetRoyaltyReportByMonthAsync(userId, fromMonth, fromYear, toMonth, toYear);
            return Ok(result);
        }
    }
}
