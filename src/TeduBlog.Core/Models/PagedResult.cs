namespace TeduBlog.Core.Models
{
    public class PagedResult<T> : PagedResultBase where T : class
    {
        public List<T> Items { get; set; }

        public PagedResult()
        {
            Items = new List<T>();
        }
    }
}
