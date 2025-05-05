
using Microsoft.AspNetCore.Identity;

namespace DataAccess.Models
{
    public class ApplicationUser : IdentityUser
    {
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
