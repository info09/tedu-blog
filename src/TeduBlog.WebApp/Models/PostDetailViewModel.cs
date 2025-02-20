using TeduBlog.Core.Models.Content.Post;
using TeduBlog.Core.Models.Content.PostCategory;

namespace TeduBlog.WebApp.Models
{
    public class PostDetailViewModel
    {
        public PostDto Post { get; set; }
        public PostCategoryDto Category { get; set; }
        public List<TagDto> Tags { get; set; }
    }
}
