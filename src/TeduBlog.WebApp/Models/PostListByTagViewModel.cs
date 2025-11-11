using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Content.Post;

namespace TeduBlog.WebApp.Models
{
    public class PostListByTagViewModel
    {
        public TagDto? Tag { get; set; }
        public PagedResult<PostInListDto>? Posts { get; set; }
    }
}
