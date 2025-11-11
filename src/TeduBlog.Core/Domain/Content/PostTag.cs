using System.ComponentModel.DataAnnotations.Schema;

using Microsoft.EntityFrameworkCore;

namespace TeduBlog.Core.Domain.Content;

[Table("PostTags")]
[PrimaryKey(nameof(PostId), nameof(TagId))]
public class PostTag
{
    public Guid PostId { set; get; }
    public Guid TagId { set; get; }
}
