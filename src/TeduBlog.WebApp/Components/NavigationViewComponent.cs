using Microsoft.AspNetCore.Mvc;
using TeduBlog.Core.SeedWorks;
using TeduBlog.WebApp.Models;

namespace TeduBlog.WebApp.Components
{
    public class NavigationViewComponent : ViewComponent
    {
        private readonly IUnitOfWork _unitOfWork;

        public NavigationViewComponent(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var model = await _unitOfWork.PostCategoryRepository.GetAllAsync();
            var navItems = model.Where(i => i.IsActive).Select(x => new NavigationItemViewModel()
            {
                Slug = x.Slug,
                Name = x.Name,
                Children = model.Where(i => i.ParentId == x.Id).Select(i => new NavigationItemViewModel()
                {
                    Name = x.Name,
                    Slug = x.Slug
                }).ToList()
            }).ToList();
            return View(navItems);
        }
    }
}
