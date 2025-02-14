﻿using AutoMapper;
using System.ComponentModel.DataAnnotations;
using TeduBlog.Core.Domain.Content;

namespace TeduBlog.Core.Models.Content.Post
{
    public class PostInListDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Slug { get; set; }
        [MaxLength(500)]
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public int ViewCount { get; set; }
        public DateTime DateCreated { get; set; }
        public required string CategorySlug { set; get; }

        public required string CategoryName { set; get; }
        public string AuthorUserName { set; get; }
        public string AuthorName { set; get; }
        public PostStatus Status { set; get; }
        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<Domain.Content.Post, PostInListDto>();
            }
        }
    }
}
