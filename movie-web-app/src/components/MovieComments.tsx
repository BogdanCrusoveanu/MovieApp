import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Edit3, Trash2, Save, XCircle } from "lucide-react";

import {
  fetchComments,
  postComment,
  updateComment,
  deleteComment,
} from "../api";
import type {
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../types";
import type { RootState } from "../redux/store";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

interface MovieCommentsProps {
  movieId: number;
}

const MovieComments: React.FC<MovieCommentsProps> = ({ movieId }) => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const commentsQueryKey = ["comments", movieId];

  const {
    data: comments,
    status: commentsStatus,
    error: commentsFetchError,
  } = useQuery<Comment[], Error>({
    queryKey: commentsQueryKey,
    queryFn: () => fetchComments(movieId),
    enabled: !!movieId,
  });

  const addCommentMutation = useMutation<Comment, Error, CreateCommentPayload>({
    mutationFn: (payload) => postComment(movieId, payload),
    onSuccess: () => {
      setNewCommentText("");
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    },
    onError: (error) => console.error("Error adding comment:", error),
  });

  const updateCommentMutation = useMutation<
    void,
    Error,
    { commentId: number; payload: UpdateCommentPayload }
  >({
    mutationFn: ({ commentId, payload }) =>
      updateComment(movieId, commentId, payload),
    onSuccess: () => {
      setEditingCommentId(null);
      setEditCommentText("");
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    },
    onError: (error) => console.error("Error updating comment:", error),
  });

  const deleteCommentMutation = useMutation<void, Error, { commentId: number }>(
    {
      mutationFn: ({ commentId }) => deleteComment(movieId, commentId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      },
      onError: (error) => console.error("Error deleting comment:", error),
    }
  );

  const handleNewCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !isAuthenticated || !user) return;
    addCommentMutation.mutate({ text: newCommentText.trim() });
  };

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleUpdateSubmit = (commentId: number) => {
    if (!editCommentText.trim()) return;
    updateCommentMutation.mutate({
      commentId,
      payload: { text: editCommentText.trim() },
    });
  };

  const handleDeleteClick = (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ commentId });
    }
  };

  return (
    <div className="mt-12 px-4 py-8 bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 text-teal-400">Comments</h2>

      <div className="mb-6 space-y-4">
        {commentsStatus === "pending" && <LoadingSpinner />}
        {commentsStatus === "error" && commentsFetchError && (
          <ErrorMessage message={commentsFetchError.message} />
        )}
        {commentsStatus === "success" && comments && comments.length === 0 && (
          <p className="text-gray-400 italic">No comments yet. Be the first!</p>
        )}
        {commentsStatus === "success" &&
          comments?.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-700 p-4 rounded-lg shadow relative group"
            >
              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    rows={3}
                    className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    required
                  />
                  {updateCommentMutation.error && (
                    <ErrorMessage
                      message={updateCommentMutation.error.message}
                      className="mb-2 text-sm"
                    />
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleUpdateSubmit(comment.id)}
                      disabled={
                        updateCommentMutation.isPending ||
                        !editCommentText.trim()
                      }
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs font-semibold transition disabled:opacity-50"
                    >
                      {updateCommentMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Save className="w-4 h-4 inline mr-1" />
                      )}{" "}
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateCommentMutation.isPending}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded text-white text-xs font-semibold transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 inline mr-1" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-white">
                      {comment.username}
                    </p>
                    {isAuthenticated && user?.userId === comment.userId && (
                      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(comment)}
                          title="Edit Comment"
                          className="p-1 text-blue-400 hover:text-blue-300 disabled:opacity-50"
                          disabled={deleteCommentMutation.isPending}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(comment.id)}
                          title="Delete Comment"
                          className="p-1 text-red-500 hover:text-red-400 disabled:opacity-50"
                          disabled={
                            deleteCommentMutation.isPending &&
                            deleteCommentMutation.variables?.commentId ===
                              comment.id
                          }
                        >
                          {deleteCommentMutation.isPending &&
                          deleteCommentMutation.variables?.commentId ===
                            comment.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {comment.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                  {deleteCommentMutation.isError &&
                    deleteCommentMutation.variables?.commentId ===
                      comment.id && (
                      <ErrorMessage
                        message={deleteCommentMutation.error.message}
                        className="mt-2 text-xs"
                      />
                    )}
                </>
              )}
            </div>
          ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-white">
          {isAuthenticated
            ? `Leave a Comment as ${user?.username}`
            : "Login to Leave a Comment"}
        </h3>
        {addCommentMutation.error && (
          <ErrorMessage
            message={addCommentMutation.error.message}
            className="mb-2"
          />
        )}
        <form onSubmit={handleNewCommentSubmit}>
          <textarea
            rows={3}
            placeholder={
              isAuthenticated
                ? "Write your comment here..."
                : "Please login first..."
            }
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={!isAuthenticated || addCommentMutation.isPending}
            aria-label="Comment input area"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !isAuthenticated ||
              addCommentMutation.isPending ||
              !newCommentText.trim()
            }
          >
            {addCommentMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              "Submit Comment"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MovieComments;
