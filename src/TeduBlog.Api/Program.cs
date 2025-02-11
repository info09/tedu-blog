
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;
using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.Models.Content;
using TeduBlog.Core.SeedWorks;
using TeduBlog.Data;
using TeduBlog.Data.Repositories;
using TeduBlog.Data.SeedWorks;

namespace TeduBlog.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var configuration = builder.Configuration;
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // Add services to the container.

            // Configure DB and ASP.NET Core Identity
            builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));

            builder.Services.AddIdentity<AppUser, AppRole>(options => options.SignIn.RequireConfirmedAccount = false).AddEntityFrameworkStores<ApplicationDbContext>();

            builder.Services.Configure<IdentityOptions>(options =>
            {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 6;
                options.Password.RequiredUniqueChars = 1;

                // Lockout settings.
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings.
                options.User.AllowedUserNameCharacters =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = false;
            });

            // Add Service to container
            builder.Services.AddScoped(typeof(IRepositoryBase<,>), typeof(RepositoryBase<,>));
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Business services and repositories
            var services = typeof(PostRepository).Assembly.GetTypes()
                .Where(i => i.GetInterfaces().Any(i => i.Name == typeof(IRepositoryBase<,>).Name) && 
                            !i.IsAbstract && 
                            i.IsClass && 
                            !i.IsGenericType);

            foreach (var service in services)
            {
                var allInterfaces = service.GetInterfaces();
                var directInterface = allInterfaces.Except(allInterfaces.SelectMany(i => i.GetInterfaces())).FirstOrDefault();
                if (directInterface != null)
                {
                    builder.Services.Add(new ServiceDescriptor(directInterface, service, ServiceLifetime.Scoped));
                }
            }

            builder.Services.AddAutoMapper(typeof(PostInListDto));

            //Default config for ASP.NET Core

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.CustomOperationIds(apiDes =>
                {
                    return apiDes.TryGetMethodInfo(out MethodInfo methodInfo) ? methodInfo.Name : null;
                });
                c.SwaggerDoc("AdminAPI", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Version = "v1",
                    Title = "API for Administrators",
                    Description = "API for CMS core domain. This domain keeps track of campaigns, campaign rules, and campaign execution."
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("AdminAPI/swagger.json", "Admin API");
                    c.DisplayOperationId();
                    c.DisplayRequestDuration();
                });
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.MigrateDatabase();

            app.Run();
        }
    }
}
