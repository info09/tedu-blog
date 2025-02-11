using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeduBlog.Core.Domain.Identity;

namespace TeduBlog.Data
{
    public class DataSeeder
    {
        public async Task SeedAsync(ApplicationDbContext context)
        {
            var passwordHasher = new PasswordHasher<AppUser>();
            var rootAdminRoleId = Guid.NewGuid();
            var rootUserRoleId = Guid.NewGuid();
            if (!context.Roles.Any())
            {
                await context.Roles.AddAsync(new AppRole()
                {
                    Id = rootAdminRoleId,
                    DisplayName = "Quản trị viên",
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                });

                await context.Roles.AddAsync(new AppRole()
                {
                    Id = rootUserRoleId,
                    DisplayName = "Người dùng",
                    Name = "User",
                    NormalizedName = "USER"
                });

                await context.SaveChangesAsync();
            }

            if (!context.Users.Any())
            {
                var userAdminId = Guid.NewGuid();
                var userId = Guid.NewGuid();

                var userAdmin = new AppUser()
                {
                    Id = userAdminId,
                    FirstName = "Admin",
                    LastName = "Admin",
                    Email = "admin@gmail.com",
                    NormalizedEmail = "ADMIN@GMAIL.COM",
                    UserName = "admin",
                    IsActive = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    LockoutEnabled = false,
                    DateCreated = DateTime.UtcNow,
                };
                userAdmin.PasswordHash = passwordHasher.HashPassword(userAdmin, "Admin@123$");
                await context.Users.AddAsync(userAdmin);

                var user = new AppUser()
                {
                    Id = userId,
                    FirstName = "Huy",
                    LastName = "Tran",
                    Email = "huytq3103@gmail.com",
                    NormalizedEmail = "HUYTQ3103@GMAIL.COM",
                    UserName = "huytq",
                    IsActive = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    LockoutEnabled = false,
                    DateCreated = DateTime.UtcNow,
                };
                user.PasswordHash = passwordHasher.HashPassword(user, "Admin@123$");
                await context.Users.AddAsync(user);

                await context.UserRoles.AddAsync(new IdentityUserRole<Guid>()
                {
                    RoleId = rootAdminRoleId,
                    UserId = userAdminId,
                });
                await context.UserRoles.AddAsync(new IdentityUserRole<Guid>()
                {
                    RoleId = rootUserRoleId,
                    UserId = userId,
                });
                await context.SaveChangesAsync();
            }
        }
    }
}
