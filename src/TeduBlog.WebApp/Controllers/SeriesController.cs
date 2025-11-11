using Microsoft.AspNetCore.Mvc;

using TeduBlog.Core.SeedWorks;

namespace TeduBlog.WebApp.Controllers;

public class SeriesController : Controller
{
    private readonly IUnitOfWork _unitOfWork;

    public SeriesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [Route("/series")]
    public async Task<IActionResult> Index([FromQuery] int page = 1)
    {
        var series = await _unitOfWork.SeriesRepository.GetAllPaging(string.Empty, page);
        return View(series);
    }
}
