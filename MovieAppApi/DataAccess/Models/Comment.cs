using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Models
{
    public class Comment
    {
        [Key] 
        public int Id { get; set; }

        [Required]
        public int MovieId { get; set; } 

        [Required]
        [MaxLength(1000)] 
        public string Text { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; } 
    }
}
