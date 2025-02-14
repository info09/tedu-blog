namespace TeduBlog.Core.Models.System.User
{
    public class ChangeMyPasswordRequest
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
