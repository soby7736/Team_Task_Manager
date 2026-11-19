
import { useState } from "react";
import { useSelector } from "react-redux";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getComments,
  createComment,
} from "../services/commentService";

function TaskComments({ taskId, assigneeId }) {
  const [text, setText] = useState("");

  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  // Only the assigned employee can comment.
  const canComment =
    user?.id != null &&
    assigneeId != null &&
    String(user.id) === String(assigneeId);

  // Fetch comments for this task.
  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getComments(taskId),
    enabled: !!taskId,
  });

  // Create a comment.
  const commentMutation = useMutation({
    mutationFn: (commentText) => {
      if (!canComment) {
        throw new Error(
          "Only the assigned employee can comment."
        );
      }

      return createComment(taskId, commentText, user);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", taskId],
      });

      setText("");
    },
  });

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !canComment ||
      !text.trim() ||
      commentMutation.isPending
    ) {
      return;
    }

    commentMutation.mutate(text.trim());
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">
          Comments
        </h2>

        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
          {comments.length} Comments
        </span>
      </div>

      {/* Only the assigned employee sees the form */}
      {canComment ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <label
            htmlFor="task-comment"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Add a Comment
          </label>

          <textarea
            id="task-comment"
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Write your comment..."
            rows={3}
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={
              !text.trim() ||
              commentMutation.isPending
            }
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {commentMutation.isPending
              ? "Posting..."
              : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
          <p className="text-sm text-amber-800">
            Only the employee assigned to this task
            can add comments.
          </p>
        </div>
      )}

      {commentMutation.isError && (
        <p className="text-red-600 text-sm mb-4">
          {commentMutation.error?.message ||
            "Failed to post comment."}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-slate-500">
          Loading comments...
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          Failed to load comments.
        </p>
      )}

      {!isLoading &&
        !isError &&
        comments.length === 0 && (
          <p className="text-sm text-slate-500">
            No comments yet.
          </p>
        )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-50 rounded-lg p-4 border border-slate-100"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {comment.authorName}
                </p>

                <p className="text-xs text-slate-400">
                  {comment.createdAt
                    ? new Date(
                        comment.createdAt
                      ).toLocaleString()
                    : ""}
                </p>
              </div>

              <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskComments;
