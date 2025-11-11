using AutoMapper;

using TeduBlog.Core.Domain.Content;

namespace TeduBlog.Core.Models.Content.Post;

public class TagDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = default!;
    public required string Name { get; set; }

    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<Tag, TagDto>();
        }
    }
}
