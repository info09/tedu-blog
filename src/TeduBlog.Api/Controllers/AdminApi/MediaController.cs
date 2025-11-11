using System.Net.Http.Headers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

using TeduBlog.Core.ConfigOptions;

namespace TeduBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly MediaSettings _mediaSettings;

        public MediaController(IWebHostEnvironment webHostEnvironment, IOptions<MediaSettings> mediaSettings)
        {
            _webHostEnvironment = webHostEnvironment;
            _mediaSettings = mediaSettings.Value;
        }

        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult UploadImage(string type)
        {
            var allowImageTypes = _mediaSettings.AllowImageFileTypes?.Split(',');
            var now = DateTime.Now;
            var files = Request.Form.Files;
            if (files.Count == 0)
            {
                return null!;
            }

            var file = files[0];
            var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition)?.FileName?.Trim('"');
            if (allowImageTypes?.Any(x => fileName?.EndsWith(x, StringComparison.OrdinalIgnoreCase) == true) == false)
            {
                var exception = new Exception("Không cho phép tải lên file không phải ảnh.");
                throw exception;
            }

            var imageFolder = Path.Combine(_mediaSettings.ImageFolder!, now.ToString("MMyyyy"));
            var folder = Path.Combine(_webHostEnvironment.WebRootPath, _mediaSettings.ImageFolder!, now.ToString("MMyyyy"));

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
