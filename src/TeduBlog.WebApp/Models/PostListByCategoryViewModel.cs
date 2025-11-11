using TeduBlog.Core.Models;
using TeduBlog.Core.Models.Content.Post;
using TeduBlog.Core.Models.Content.PostCategory;

namespace TeduBlog.WebApp.Models
{
    public class PostListByCategoryViewModel
    {
        public PostCategoryDto? Category { get; set; }
        public PagedResult<PostInListDto>? Posts { get; set; }
    }
}
