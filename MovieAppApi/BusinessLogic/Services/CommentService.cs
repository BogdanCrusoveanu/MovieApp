using BusinessLogic.Dtos.Comment;
using BusinessLogic.Enums;
using BusinessLogic.Interfaces;
using DataAccess.Interfaces;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;

namespace BusinessLogic.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public CommentService(ICommentRepository commentRepository, UserManager<ApplicationUser> userManager)
        {
            _commentRepository = commentRepository;
            _userManager = userManager;
        }

        public async Task<(CommentDto? comment, CommentOperationResult result)> AddCommentAsync(int movieId, string userId, string text)
        {
            if (string.IsNullOrWhiteSpace(text) || text.Length > 1000)
            {
                return (null, CommentOperationResult.ValidationError);
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (null, CommentOperationResult.NotFound);
            }

            var comment = new Comment
            {
                MovieId = movieId,
                UserId = userId,
                Text = text,
                Timestamp = DateTime.UtcNow
            };

            try
            {
                var addedComment = await _commentRepository.AddAsync(comment);
                var commentDto = new CommentDto
                {
                    Id = addedComment.Id,
                    MovieId = addedComment.MovieId,
                    Text = addedComment.Text,
                    Timestamp = addedComment.Timestamp,
                    UserId = addedComment.UserId,
                    Username = user.UserName ?? "Unknown"
                };
                return (commentDto, CommentOperationResult.Success);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding comment in service: {ex.Message}");
                return (null, CommentOperationResult.Error);
            }
        }

        public async Task<IEnumerable<CommentDto>> GetCommentsByMovieIdAsync(int movieId)
        {
            var comments = await _commentRepository.GetByMovieIdAsync(movieId);
            return comments.Select(c => new CommentDto
            {
                Id = c.Id,
                MovieId = c.MovieId,
                Text = c.Text,
                Timestamp = c.Timestamp,
                UserId = c.UserId,
                Username = c.User?.UserName ?? "Unknown User"
            });
        }

        public async Task<CommentOperationResult> UpdateCommentAsync(int commentId, string userId, string newText)
        {
            if (string.IsNullOrWhiteSpace(newText) || newText.Length > 1000)
            {
                return CommentOperationResult.ValidationError;
            }

            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null) return CommentOperationResult.NotFound;
            if (comment.UserId != userId) return CommentOperationResult.Forbidden;

            comment.Text = newText;
            comment.Timestamp = DateTime.UtcNow;

            try
            {
                bool success = await _commentRepository.UpdateAsync(comment);
                return success ? CommentOperationResult.Success : CommentOperationResult.Error;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating comment {commentId} in service: {ex.Message}");
                return CommentOperationResult.Error;
            }
        }

        public async Task<CommentOperationResult> DeleteCommentAsync(int commentId, string userId)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null) return CommentOperationResult.NotFound;
            if (comment.UserId != userId) return CommentOperationResult.Forbidden;

            try
            {
                bool success = await _commentRepository.DeleteAsync(commentId);
                return success ? CommentOperationResult.Success : CommentOperationResult.NotFound;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting comment {commentId} in service: {ex.Message}");
                return CommentOperationResult.Error;
            }
        }
    }
}
