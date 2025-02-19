using Microsoft.AspNetCore.Mvc;
using TeduBlog.Core.SeedWorks;
using TeduBlog.WebApp.Models;

namespace TeduBlog.WebApp.Controllers
{
    public class PostController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public PostController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IActionResult Index()
        {
            return View();
        }

        [Route("posts/{categorySlug}")]
        public async Task<IActionResult> ListByCategory([FromRoute]string categorySlug, [FromQuery] int page = 1)
        {
            var posts = await _unitOfWork.PostRepository.GetPostByCategoryPaging(categorySlug, page, 2);
            var category = await _unitOfWork.PostCategoryRepository.GetBySlug(categorySlug);
            if (category == null)
            {
                return NotFound();
            }
            return View(new PostListByCategoryViewModel()
            {
                Posts = posts,
                Category = category
            });
        }
    }
}
