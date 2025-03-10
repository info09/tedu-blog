namespace TeduBlog.Core.ConfigOptions
{
    public class JwtTokenSettings
    {
        public string Key { get; set; } = default!;
        public string Issuer { get; set; } = default!;
        public int ExpireInHours { get; set; }
    }
}
