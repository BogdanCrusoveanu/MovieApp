using DataAccess.Models;

namespace DataAccess.Interfaces
{
    public interface ICommentRepository
    {
        Task<IEnumerable<Comment>> GetByMovieIdAsync(int movieId);
        Task<Comment?> GetByIdAsync(int commentId);
        Task<Comment> AddAsync(Comment comment);
        Task<bool> UpdateAsync(Comment comment);
        Task<bool> DeleteAsync(int commentId);
        Task<bool> UserExistsAsync(string userId);
    }
}
