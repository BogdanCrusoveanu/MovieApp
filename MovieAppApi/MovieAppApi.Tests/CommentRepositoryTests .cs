using DataAccess.Data;
using DataAccess.Models;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace MovieAppApi.Tests
{
    public class CommentRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly CommentRepository _repository;
        private readonly DbContextOptions<ApplicationDbContext> _options;

        public CommentRepositoryTests()
        {
            // Use a unique database name for each test run to prevent interference
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(_options);
            _repository = new CommentRepository(_context);
        }

        public void Dispose()
        {
            // Ensure the database is deleted after each test
            _context.Database.EnsureDeleted();
            _context.Dispose();
            GC.SuppressFinalize(this);
        }

        private async Task SeedDatabase()
        {
            var users = new List<ApplicationUser>
            {
                new ApplicationUser { Id = "user1", UserName = "UserOne" },
                new ApplicationUser { Id = "user2", UserName = "UserTwo" }
            };
            _context.Users.AddRange(users);

            var comments = new List<Comment>
            {
                new Comment { Id = 1, MovieId = 100, Text = "Comment 1 Movie 100", UserId = "user1", Timestamp = DateTime.UtcNow.AddMinutes(-10) },
                new Comment { Id = 2, MovieId = 100, Text = "Comment 2 Movie 100", UserId = "user2", Timestamp = DateTime.UtcNow.AddMinutes(-5) },
                new Comment { Id = 3, MovieId = 200, Text = "Comment 1 Movie 200", UserId = "user1", Timestamp = DateTime.UtcNow }
            };
            _context.Comments.AddRange(comments);
            await _context.SaveChangesAsync();
        }

        [Fact]
        public async Task AddAsync_ShouldAddCommentAndReturnIt()
        {
            // Arrange
            var newComment = new Comment { MovieId = 300, Text = "New Comment", UserId = "user1", Timestamp = DateTime.UtcNow };

            // Act
            var addedComment = await _repository.AddAsync(newComment);
            var commentInDb = await _context.Comments.FindAsync(addedComment.Id);

            // Assert
            Xunit.Assert.NotNull(addedComment);
            Xunit.Assert.Equal("New Comment", addedComment.Text);
            Xunit.Assert.NotNull(commentInDb);
            Xunit.Assert.Equal(addedComment.Id, commentInDb.Id);
            Xunit.Assert.Equal(1, await _context.Comments.CountAsync(c => c.MovieId == 300)); // Check count after add
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveCommentAndReturnTrue_WhenExists()
        {
            // Arrange
            await SeedDatabase();
            int commentIdToDelete = 1;

            // Act
            var result = await _repository.DeleteAsync(commentIdToDelete);
            var commentInDb = await _context.Comments.FindAsync(commentIdToDelete);

            // Assert
            Xunit.Assert.True(result);
            Xunit.Assert.Null(commentInDb);
            Xunit.Assert.Equal(2, await _context.Comments.CountAsync()); // Check count after delete
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFalse_WhenNotExists()
        {
            // Arrange
            await SeedDatabase();
            int nonExistentCommentId = 999;

            // Act
            var result = await _repository.DeleteAsync(nonExistentCommentId);

            // Assert
            Xunit.Assert.False(result);
            Xunit.Assert.Equal(3, await _context.Comments.CountAsync()); // Count should remain unchanged
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnComment_WhenExists()
        {
            // Arrange
            await SeedDatabase();
            int commentIdToGet = 2;

            // Act
            var comment = await _repository.GetByIdAsync(commentIdToGet);

            // Assert
            Xunit.Assert.NotNull(comment);
            Xunit.Assert.Equal(commentIdToGet, comment.Id);
            Xunit.Assert.Equal("Comment 2 Movie 100", comment.Text);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
        {
            // Arrange
            await SeedDatabase();
            int nonExistentCommentId = 999;

            // Act
            var comment = await _repository.GetByIdAsync(nonExistentCommentId);

            // Assert
            Xunit.Assert.Null(comment);
        }

        [Fact]
        public async Task GetByMovieIdAsync_ShouldReturnCommentsForMovie_OrderedByTimestampDesc()
        {
            // Arrange
            await SeedDatabase();
            int movieIdToGet = 100;

            // Act
            var comments = (await _repository.GetByMovieIdAsync(movieIdToGet)).ToList();

            // Assert
            Xunit.Assert.Equal(2, comments.Count);
            Xunit.Assert.Equal(2, comments[0].Id); // Comment 2 is newer
            Xunit.Assert.Equal(1, comments[1].Id); // Comment 1 is older
            Xunit.Assert.NotNull(comments[0].User); // Check Include worked
            Xunit.Assert.Equal("UserTwo", comments[0]?.User?.UserName);
        }

        [Fact]
        public async Task UpdateAsync_ShouldModifyCommentAndReturnTrue()
        {
            // Arrange
            await SeedDatabase();
            int commentIdToUpdate = 1;
            var commentToUpdate = await _context.Comments.FindAsync(commentIdToUpdate);
            Xunit.Assert.NotNull(commentToUpdate); // Ensure it exists before update
            commentToUpdate.Text = "Updated Text";

            // Act: Detach the tracked entity before calling UpdateAsync if needed,
            // or just call UpdateAsync if it handles attaching/modifying state.
            // The current implementation uses _context.Entry(comment).State = Modified;
            // So we need to ensure the entity passed is the one to be updated.
            var result = await _repository.UpdateAsync(commentToUpdate);
            var updatedCommentInDb = await _context.Comments.AsNoTracking().FirstOrDefaultAsync(c => c.Id == commentIdToUpdate);

            // Assert
            Xunit.Assert.True(result);
            Xunit.Assert.NotNull(updatedCommentInDb);
            Xunit.Assert.Equal("Updated Text", updatedCommentInDb.Text);
        }

        [Fact]
        public async Task UserExistsAsync_ShouldReturnTrue_WhenUserExists()
        {
            // Arrange
            await SeedDatabase();

            // Act & Assert
            Xunit.Assert.True(await _repository.UserExistsAsync("user1"));
            Xunit.Assert.True(await _repository.UserExistsAsync("user2"));
        }

        [Fact]
        public async Task UserExistsAsync_ShouldReturnFalse_WhenUserDoesNotExist()
        {
            // Arrange
            await SeedDatabase();

            // Act & Assert
            Xunit.Assert.False(await _repository.UserExistsAsync("non-existent-user"));
        }
    }
}
