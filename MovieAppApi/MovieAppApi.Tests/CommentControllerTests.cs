using BusinessLogic.Dtos.Comment;
using BusinessLogic.Enums;
using BusinessLogic.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieAppApi.Controllers;
using System.Security.Claims;
using Xunit;

namespace MovieAppApi.Tests
{
    public class CommentControllerTests
    {
        private readonly Mock<ICommentService> _mockCommentService;
        private readonly CommentController _controller;
        private const string TestUserId = "test-user-id";
        private const int TestMovieId = 1;
        private const int TestCommentId = 10;

        public CommentControllerTests()
        {
            _mockCommentService = new Mock<ICommentService>();

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, TestUserId),
            }, "mock"));

            _controller = new CommentController(_mockCommentService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext { User = user }
                }
            };
        }

        // --- GetComments Tests ---

        [Fact]
        public async Task GetComments_ReturnsOkObjectResult_WithListOfComments()
        {
            // Arrange
            var comments = new List<CommentDto>
            {
                new CommentDto { Id = 1, Text = "Comment 1", UserId = "user1", Username = "UserOne" },
                new CommentDto { Id = 2, Text = "Comment 2", UserId = TestUserId, Username = "TestUser" }
            };
            _mockCommentService.Setup(s => s.GetCommentsByMovieIdAsync(TestMovieId)).ReturnsAsync(comments);

            // Act
            var result = await _controller.GetComments(TestMovieId);

            // Assert
            var okResult = Xunit.Assert.IsType<OkObjectResult>(result);
            var returnedComments = Xunit.Assert.IsAssignableFrom<IEnumerable<CommentDto>>(okResult.Value);
            Xunit.Assert.Equal(comments.Count, ((List<CommentDto>)returnedComments).Count);
            _mockCommentService.Verify(s => s.GetCommentsByMovieIdAsync(TestMovieId), Times.Once);
        }

        // --- PostComment Tests ---

        [Fact]
        public async Task PostComment_ValidModel_ReturnsCreated()
        {
            // Arrange
            var createDto = new CreateCommentDto { Text = "New comment text" };
            var createdCommentDto = new CommentDto { Id = TestCommentId, Text = createDto.Text, UserId = TestUserId, MovieId = TestMovieId, Username = "TestUser" };
            _mockCommentService.Setup(s => s.AddCommentAsync(TestMovieId, TestUserId, createDto.Text))
                             .ReturnsAsync((createdCommentDto, CommentOperationResult.Success));

            // Act
            var result = await _controller.PostComment(TestMovieId, createDto);

            // Assert
            var createdResult = Xunit.Assert.IsType<ObjectResult>(result);
            Xunit.Assert.Equal(StatusCodes.Status201Created, createdResult.StatusCode);
            Xunit.Assert.Equal(createdCommentDto, createdResult.Value);
            _mockCommentService.Verify(s => s.AddCommentAsync(TestMovieId, TestUserId, createDto.Text), Times.Once);
        }

        [Fact]
        public async Task PostComment_ValidationError_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateCommentDto { Text = "" }; // Invalid text
            _mockCommentService.Setup(s => s.AddCommentAsync(TestMovieId, TestUserId, createDto.Text))
                             .ReturnsAsync((null, CommentOperationResult.ValidationError));

            // Act
            var result = await _controller.PostComment(TestMovieId, createDto);

            // Assert
            var badRequestResult = Xunit.Assert.IsType<BadRequestObjectResult>(result);
            Xunit.Assert.Equal("Invalid comment text.", badRequestResult.Value);
            _mockCommentService.Verify(s => s.AddCommentAsync(TestMovieId, TestUserId, createDto.Text), Times.Once);
        }

        [Fact]
        public async Task PostComment_UserNotFound_ReturnsNotFound()
        {
            // Arrange
            var createDto = new CreateCommentDto { Text = "Valid text" };
            _mockCommentService.Setup(s => s.AddCommentAsync(TestMovieId, TestUserId, createDto.Text))
                             .ReturnsAsync((null, CommentOperationResult.NotFound));

            // Act
            var result = await _controller.PostComment(TestMovieId, createDto);

            // Assert
            var notFoundResult = Xunit.Assert.IsType<NotFoundObjectResult>(result);
            Xunit.Assert.Equal("User not found.", notFoundResult.Value);
            _mockCommentService.Verify(s => s.AddCommentAsync(TestMovieId, TestUserId, createDto.Text), Times.Once);
        }

        [Fact]
        public async Task PostComment_ServiceError_ReturnsInternalServerError()
        {
            // Arrange
            var createDto = new CreateCommentDto { Text = "Valid text" };
            _mockCommentService.Setup(s => s.AddCommentAsync(TestMovieId, TestUserId, createDto.Text))
                             .ReturnsAsync((null, CommentOperationResult.Error));

            // Act
            var result = await _controller.PostComment(TestMovieId, createDto);

            // Assert
            var statusCodeResult = Xunit.Assert.IsType<ObjectResult>(result);
            Xunit.Assert.Equal(StatusCodes.Status500InternalServerError, statusCodeResult.StatusCode);
            Xunit.Assert.Equal("An error occurred while creating the comment.", statusCodeResult.Value);
        }

        [Fact]
        public async Task PostComment_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var createDto = new CreateCommentDto { Text = "Test" };
            _controller.ModelState.AddModelError("Text", "Required"); // Simulate model state error

            // Act
            var result = await _controller.PostComment(TestMovieId, createDto);

            // Assert
            var badRequestResult = Xunit.Assert.IsType<BadRequestObjectResult>(result);
            Xunit.Assert.IsType<SerializableError>(badRequestResult.Value); // Check it returns the model state errors
            _mockCommentService.Verify(s => s.AddCommentAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        // --- UpdateComment Tests ---

        [Fact]
        public async Task UpdateComment_ValidUpdate_ReturnsNoContent()
        {
            // Arrange
            var updateDto = new UpdateCommentDto { Text = "Updated comment text" };
            _mockCommentService.Setup(s => s.UpdateCommentAsync(TestCommentId, TestUserId, updateDto.Text))
                             .ReturnsAsync(CommentOperationResult.Success);

            // Act
            var result = await _controller.UpdateComment(TestMovieId, TestCommentId, updateDto);

            // Assert
            Xunit.Assert.IsType<NoContentResult>(result);
            _mockCommentService.Verify(s => s.UpdateCommentAsync(TestCommentId, TestUserId, updateDto.Text), Times.Once);
        }

        [Fact]
        public async Task UpdateComment_NotFound_ReturnsNotFound()
        {
            // Arrange
            var updateDto = new UpdateCommentDto { Text = "Updated text" };
            _mockCommentService.Setup(s => s.UpdateCommentAsync(TestCommentId, TestUserId, updateDto.Text))
                             .ReturnsAsync(CommentOperationResult.NotFound);

            // Act
            var result = await _controller.UpdateComment(TestMovieId, TestCommentId, updateDto);

            // Assert
            var notFoundResult = Xunit.Assert.IsType<NotFoundObjectResult>(result);
            Xunit.Assert.Equal($"Comment with ID {TestCommentId} not found.", notFoundResult.Value);
        }

        [Fact]
        public async Task UpdateComment_Forbidden_ReturnsForbid()
        {
            // Arrange
            var updateDto = new UpdateCommentDto { Text = "Updated text" };
            _mockCommentService.Setup(s => s.UpdateCommentAsync(TestCommentId, TestUserId, updateDto.Text))
                             .ReturnsAsync(CommentOperationResult.Forbidden);

            // Act
            var result = await _controller.UpdateComment(TestMovieId, TestCommentId, updateDto);

            // Assert
            Xunit.Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task UpdateComment_ValidationError_ReturnsBadRequest()
        {
            // Arrange
            var updateDto = new UpdateCommentDto { Text = "" }; // Invalid
            _mockCommentService.Setup(s => s.UpdateCommentAsync(TestCommentId, TestUserId, updateDto.Text))
                             .ReturnsAsync(CommentOperationResult.ValidationError);

            // Act
            var result = await _controller.UpdateComment(TestMovieId, TestCommentId, updateDto);

            // Assert
            var badRequestResult = Xunit.Assert.IsType<BadRequestObjectResult>(result);
            Xunit.Assert.Equal("Invalid comment text.", badRequestResult.Value);
        }

        // --- DeleteComment Tests ---

        [Fact]
        public async Task DeleteComment_ValidDelete_ReturnsNoContent()
        {
            // Arrange
            _mockCommentService.Setup(s => s.DeleteCommentAsync(TestCommentId, TestUserId))
                             .ReturnsAsync(CommentOperationResult.Success);

            // Act
            var result = await _controller.DeleteComment(TestMovieId, TestCommentId);

            // Assert
            Xunit.Assert.IsType<NoContentResult>(result);
            _mockCommentService.Verify(s => s.DeleteCommentAsync(TestCommentId, TestUserId), Times.Once);
        }

        [Fact]
        public async Task DeleteComment_NotFound_ReturnsNotFound()
        {
            // Arrange
            _mockCommentService.Setup(s => s.DeleteCommentAsync(TestCommentId, TestUserId))
                             .ReturnsAsync(CommentOperationResult.NotFound);

            // Act
            var result = await _controller.DeleteComment(TestMovieId, TestCommentId);

            // Assert
            var notFoundResult = Xunit.Assert.IsType<NotFoundObjectResult>(result);
            Xunit.Assert.Equal($"Comment with ID {TestCommentId} not found.", notFoundResult.Value);
        }

        [Fact]
        public async Task DeleteComment_Forbidden_ReturnsForbid()
        {
            // Arrange
            _mockCommentService.Setup(s => s.DeleteCommentAsync(TestCommentId, TestUserId))
                             .ReturnsAsync(CommentOperationResult.Forbidden);

            // Act
            var result = await _controller.DeleteComment(TestMovieId, TestCommentId);

            // Assert
            Xunit.Assert.IsType<ForbidResult>(result);
        }
    }
}
