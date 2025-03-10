using AutoMapper;

using TeduBlog.Core.Domain.Identity;

namespace TeduBlog.Core.Models.System.Role
{
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<AppRole, RoleDto>();
            }
        }
    }
}
