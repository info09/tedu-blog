using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using TeduBlog.Core.ConfigOptions;

namespace TeduBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly MediaSettings _mediaSettings;
        private readonly IConfiguration _configuration;

        public MediaController(IWebHostEnvironment webHostEnvironment, IOptions<MediaSettings> mediaSettings, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _mediaSettings = mediaSettings.Value;
            _configuration = configuration;
        }

        [HttpPost]
        [AllowAnonymous]
        public IActionResult UploadImage(string type)
        {
            var allowImageTypes = _mediaSettings.AllowImageFileTypes?.Split(',');
            var now = DateTime.Now;
            var files = Request.Form.Files;
            if (files.Count == 0)
                return null!;

            var file = files[0];
            var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition)?.FileName?.Trim('"');
            if (allowImageTypes?.Any(x => fileName?.EndsWith(x, StringComparison.OrdinalIgnoreCase) == true) == false)
            {
                throw new Exception("Không cho phép tải lên file không phải ảnh.");
            }
            var imageFolder = $@"\{_mediaSettings.ImageFolder}\images\{type}\{now:MMyyyy}";
            var folder = _configuration["ImageStoragePath"] + imageFolder;
            //var folder = _webHostEnvironment.WebRootPath + imageFolder;

            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }
            var filePath = Path.Combine(folder, fileName!);
            using (var fs = global::System.IO.File.Create(filePath))
            {
                file.CopyTo(fs);
                fs.Flush();
            }
            var path = Path.Combine(imageFolder, fileName!).Replace(@"\", @"/");
            return Ok(new { path });
        }
    }
}
