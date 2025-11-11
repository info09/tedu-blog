using System.ComponentModel.DataAnnotations;

using AutoMapper;

using TeduBlog.Core.Domain.Content;

namespace TeduBlog.Core.Models.Content.Post;

public class SeriesDto : SeriesInListDto
{
    [MaxLength(250)]
    public string? SeoDescription { get; set; }
    [MaxLength(250)]
    public string? Thumbnail { set; get; }
    public string? Content { get; set; }
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Series, SeriesDto>();
        }
    }
}
