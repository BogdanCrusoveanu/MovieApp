namespace BusinessLogic.Dtos.Comment
{
    public class CommentDto
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
    }
}
