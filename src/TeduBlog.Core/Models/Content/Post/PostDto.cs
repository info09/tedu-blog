using AutoMapper;

namespace TeduBlog.Core.Models.Content.Post
{
    public class PostDto : PostInListDto
    {
        public Guid CategoryId { get; set; }
        public string? Content { get; set; }
        public Guid AuthorUserId { get; set; }
        public string? Source { get; set; }
        public string? Tags { get; set; }
        public string? SeoDescription { get; set; }
        public DateTime? DateModified { get; set; }

        public class AutoMapperProfile : Profile
        {
            public AutoMapperProfile()
            {
                CreateMap<Domain.Content.Post, PostDto>();
            }
        }
    }
}
