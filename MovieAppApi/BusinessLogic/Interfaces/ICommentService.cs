using BusinessLogic.Dtos.Comment;
using BusinessLogic.Enums;

namespace BusinessLogic.Interfaces
{
    public interface ICommentService
    {
        Task<IEnumerable<CommentDto>> GetCommentsByMovieIdAsync(int movieId);
        Task<(CommentDto? comment, CommentOperationResult result)> AddCommentAsync(int movieId, string userId, string text);
        Task<CommentOperationResult> UpdateCommentAsync(int commentId, string userId, string newText);
        Task<CommentOperationResult> DeleteCommentAsync(int commentId, string userId);
    }
}
