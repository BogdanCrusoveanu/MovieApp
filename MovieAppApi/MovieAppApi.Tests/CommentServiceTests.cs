using BusinessLogic.Enums;
using BusinessLogic.Services;
using DataAccess.Interfaces;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Moq;
using Xunit;

namespace MovieAppApi.Tests
{
    public class CommentServiceTests
    {
        private readonly Mock<ICommentRepository> _mockCommentRepo;
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
        private readonly CommentService _commentService;
        private const string TestUserId = "test-user-id";
        private const string TestUsername = "TestUser";
        private const int TestMovieId = 1;
        private const int TestCommentId = 10;

        public CommentServiceTests()
        {
            _mockCommentRepo = new Mock<ICommentRepository>();

            var store = new Mock<IUserStore<ApplicationUser>>();
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);

            _commentService = new CommentService(_mockCommentRepo.Object, _mockUserManager.Object);

            _mockUserManager.Setup(x => x.FindByIdAsync(TestUserId))
                            .ReturnsAsync(new ApplicationUser { Id = TestUserId, UserName = TestUsername });
            _mockUserManager.Setup(x => x.FindByIdAsync("non-existent-user"))
                            .ReturnsAsync((ApplicationUser)null);
        }

        // --- AddCommentAsync Tests ---

        [Fact]
        public async Task AddCommentAsync_ValidInput_ReturnsSuccessWithDto()
        {
            // Arrange
            string text = "Valid comment";
            var commentToAdd = new Comment { MovieId = TestMovieId, UserId = TestUserId, Text = text, Timestamp = DateTime.UtcNow };
            var addedComment = new Comment { Id = TestCommentId, MovieId = TestMovieId, UserId = TestUserId, Text = text, Timestamp = DateTime.UtcNow };

            _mockCommentRepo.Setup(r => r.AddAsync(It.Is<Comment>(c => c.Text == text && c.UserId == TestUserId && c.MovieId == TestMovieId)))
                            .ReturnsAsync(addedComment);

            // Act
            var (commentDto, result) = await _commentService.AddCommentAsync(TestMovieId, TestUserId, text);

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.Success, result);
            Xunit.Assert.NotNull(commentDto);
            Xunit.Assert.Equal(TestCommentId, commentDto.Id);
            Xunit.Assert.Equal(text, commentDto.Text);
            Xunit.Assert.Equal(TestUserId, commentDto.UserId);
            Xunit.Assert.Equal(TestUsername, commentDto.Username);
            _mockCommentRepo.Verify(r => r.AddAsync(It.IsAny<Comment>()), Times.Once);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData(" ")]
        public async Task AddCommentAsync_InvalidText_ReturnsValidationError(string invalidText)
        {
            // Act
            var (commentDto, result) = await _commentService.AddCommentAsync(TestMovieId, TestUserId, invalidText);

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.ValidationError, result);
            Xunit.Assert.Null(commentDto);
            _mockCommentRepo.Verify(r => r.AddAsync(It.IsAny<Comment>()), Times.Never);
        }

        [Fact]
        public async Task AddCommentAsync_UserNotFound_ReturnsNotFound()
        {
            // Arrange
            string text = "Valid comment";
            string nonExistentUserId = "non-existent-user";

            // Act
            var (commentDto, result) = await _commentService.AddCommentAsync(TestMovieId, nonExistentUserId, text);

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.NotFound, result);
            Xunit.Assert.Null(commentDto);
            _mockCommentRepo.Verify(r => r.AddAsync(It.IsAny<Comment>()), Times.Never);
        }

        [Fact]
        public async Task AddCommentAsync_RepositoryThrowsException_ReturnsError()
        {
            // Arrange
            string text = "Valid comment";
            _mockCommentRepo.Setup(r => r.AddAsync(It.IsAny<Comment>())).ThrowsAsync(new Exception("Database error"));

            // Act
            var (commentDto, result) = await _commentService.AddCommentAsync(TestMovieId, TestUserId, text);

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.Error, result);
            Xunit.Assert.Null(commentDto);
        }

        // --- GetCommentsByMovieIdAsync Tests ---

        [Fact]
        public async Task GetCommentsByMovieIdAsync_ReturnsMappedDtos()
        {
            // Arrange
            var comments = new List<Comment>
            {
                new Comment { Id = 1, MovieId = TestMovieId, Text = "C1", UserId = TestUserId, User = new ApplicationUser { UserName = TestUsername } },
                new Comment { Id = 2, MovieId = TestMovieId, Text = "C2", UserId = "otherUser", User = new ApplicationUser { UserName = "Other" } }
            };
            _mockCommentRepo.Setup(r => r.GetByMovieIdAsync(TestMovieId)).ReturnsAsync(comments);

            // Act
            var result = await _commentService.GetCommentsByMovieIdAsync(TestMovieId);

            // Assert
            Xunit.Assert.NotNull(result);
            Xunit.Assert.Equal(2, result.Count());
            Xunit.Assert.Collection(result,
                item => Xunit.Assert.Equal("C1", item.Text),
                item => Xunit.Assert.Equal("C2", item.Text));
            Xunit.Assert.Equal(TestUsername, result.First().Username);
            Xunit.Assert.Equal("Other", result.Last().Username);
            _mockCommentRepo.Verify(r => r.GetByMovieIdAsync(TestMovieId), Times.Once);
        }

        // --- UpdateCommentAsync Tests ---

        [Fact]
        public async Task UpdateCommentAsync_ValidUpdate_ReturnsSuccess()
        {
            // Arrange
            string newText = "Updated text";
            var existingComment = new Comment { Id = TestCommentId, UserId = TestUserId, Text = "Old text" };
            _mockCommentRepo.Setup(r => r.GetByIdAsync(TestCommentId)).ReturnsAsync(existingComment);
            _mockCommentRepo.Setup(r => r.UpdateAsync(It.Is<Comment>(c => c.Id == TestCommentId && c.Text == newText))).ReturnsAsync(true);

            // Act
            var result = await _commentService.UpdateCommentAsync(TestCommentId, TestUserId, newText);

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.Success, result);
            _mockCommentRepo.Verify(r => r.GetByIdAsync(TestCommentId), Times.Once);
            _mockCommentRepo.Verify(r => r.UpdateAsync(It.Is<Comment>(c => c.Text == newText)), Times.Once);
        }

        [Fact]
        public async Task UpdateCommentAsync_CommentNotFound_ReturnsNotFound()
        {
            // Arrange
            string newText = "Updated text";
            _mockCommentRepo.Setup(r => r.GetByIdAsync(TestCommentId)).ReturnsAsync((Comment)null);

            // Act
            var result = await _commentService.UpdateCommentAsync(TestCommentId, TestUserId, newText);

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.NotFound, result);
            _mockCommentRepo.Verify(r => r.UpdateAsync(It.IsAny<Comment>()), Times.Never);
        }

        [Fact]
        public async Task UpdateCommentAsync_Forbidden_ReturnsForbidden()
        {
            // Arrange
            string newText = "Updated text";
            var existingComment = new Comment { Id = TestCommentId, UserId = "another-user-id", Text = "Old text" };
            _mockCommentRepo.Setup(r => r.GetByIdAsync(TestCommentId)).ReturnsAsync(existingComment);

            // Act
            var result = await _commentService.UpdateCommentAsync(TestCommentId, TestUserId, newText); 

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.Forbidden, result);
            _mockCommentRepo.Verify(r => r.UpdateAsync(It.IsAny<Comment>()), Times.Never);
        }

        // --- DeleteCommentAsync Tests ---

        [Fact]
        public async Task DeleteCommentAsync_ValidDelete_ReturnsSuccess()
        {
            // Arrange
            var existingComment = new Comment { Id = TestCommentId, UserId = TestUserId };
            _mockCommentRepo.Setup(r => r.GetByIdAsync(TestCommentId)).ReturnsAsync(existingComment);
            _mockCommentRepo.Setup(r => r.DeleteAsync(TestCommentId)).ReturnsAsync(true);

            // Act
            var result = await _commentService.DeleteCommentAsync(TestCommentId, TestUserId);

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.Success, result);
            _mockCommentRepo.Verify(r => r.GetByIdAsync(TestCommentId), Times.Once);
            _mockCommentRepo.Verify(r => r.DeleteAsync(TestCommentId), Times.Once);
        }

        [Fact]
        public async Task DeleteCommentAsync_CommentNotFound_ReturnsNotFound()
        {
            // Arrange
            _mockCommentRepo.Setup(r => r.GetByIdAsync(TestCommentId)).ReturnsAsync((Comment)null);

            // Act
            var result = await _commentService.DeleteCommentAsync(TestCommentId, TestUserId);

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.NotFound, result);
            _mockCommentRepo.Verify(r => r.DeleteAsync(TestCommentId), Times.Never);
        }

        [Fact]
        public async Task DeleteCommentAsync_Forbidden_ReturnsForbidden()
        {
            // Arrange
            var existingComment = new Comment { Id = TestCommentId, UserId = "another-user-id" };
            _mockCommentRepo.Setup(r => r.GetByIdAsync(TestCommentId)).ReturnsAsync(existingComment);

            // Act
            var result = await _commentService.DeleteCommentAsync(TestCommentId, TestUserId); 

            // Assert
            Xunit.Assert.Equal(CommentOperationResult.Forbidden, result);
            _mockCommentRepo.Verify(r => r.DeleteAsync(TestCommentId), Times.Never);
        }
    }
}
