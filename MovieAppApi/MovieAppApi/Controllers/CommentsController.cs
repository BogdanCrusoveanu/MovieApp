using BusinessLogic.Dtos.Comment;
using BusinessLogic.Enums;
using BusinessLogic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MovieAppApi.Controllers
{
    [Route("api/movies/{movieId}/comments")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CommentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetComments(int movieId)
        {
            var commentDtos = await _commentService.GetCommentsByMovieIdAsync(movieId);
            return Ok(commentDtos);
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(CommentDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PostComment(int movieId, [FromBody] CreateCommentDto createCommentDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized("User ID claim not found.");

            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (commentDto, result) = await _commentService.AddCommentAsync(movieId, userId, createCommentDto.Text);

            return result switch
            {
                CommentOperationResult.Success => StatusCode(StatusCodes.Status201Created, commentDto),
                CommentOperationResult.ValidationError => BadRequest("Invalid comment text."),
                CommentOperationResult.NotFound => NotFound("User not found."),
                CommentOperationResult.Error => StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the comment."),
                _ => StatusCode(StatusCodes.Status500InternalServerError, "An unknown error occurred.")
            };
        }

        [HttpPut("{commentId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateComment(int movieId, int commentId, [FromBody] UpdateCommentDto updateCommentDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized("User ID claim not found.");

            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _commentService.UpdateCommentAsync(commentId, userId, updateCommentDto.Text);

            return result switch
            {
                CommentOperationResult.Success => NoContent(),
                CommentOperationResult.NotFound => NotFound($"Comment with ID {commentId} not found."),
                CommentOperationResult.Forbidden => Forbid("You are not authorized to update this comment."),
                CommentOperationResult.ValidationError => BadRequest("Invalid comment text."),
                CommentOperationResult.Error => StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the comment."),
                _ => StatusCode(StatusCodes.Status500InternalServerError, "An unknown error occurred.")
            };
        }


        [HttpDelete("{commentId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteComment(int movieId, int commentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized("User ID claim not found.");

            var result = await _commentService.DeleteCommentAsync(commentId, userId);

            return result switch
            {
                CommentOperationResult.Success => NoContent(),
                CommentOperationResult.NotFound => NotFound($"Comment with ID {commentId} not found."),
                CommentOperationResult.Forbidden => Forbid("You are not authorized to delete this comment."),
                CommentOperationResult.Error => StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the comment."),
                _ => StatusCode(StatusCodes.Status500InternalServerError, "An unknown error occurred.")
            };
        }
    }
}
