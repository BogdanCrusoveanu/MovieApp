using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.Dtos.Comment
{
    public class CreateCommentDto
    {
        [Required]
        [MaxLength(1000)]
        public string Text { get; set; } = string.Empty;
    }
}
