
import TaskComments from "../components/TaskComments";
import { useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTaskById,
  deleteTask,
} from "../services/taskService";

import EditTaskForm from "../components/EditTaskForm";

function TaskDetails() {
  const { id, taskId } = useParams();

  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: task,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["task", id, taskId],
    queryFn: () => getTaskById(taskId, id),
    enabled: !!id && !!taskId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(taskId, id),

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["task", id, taskId],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks", id],
      });

      navigate(`/projects/${id}`);
    },
  });

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  }

  if (isLoading) {
    return <p>Loading task...</p>;
  }

  if (isError || !task) {
    return (
      <p className="text-red-500">
        Task not found.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to={`/projects/${id}`}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Back to Kanban Board
      </Link>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-5">
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          {task.title}
        </h1>

        <p className="text-sm text-slate-600 mb-4">
          {task.description ||
            "No description available"}
        </p>

        <p className="text-sm">
          <strong>Status:</strong> {task.status}
        </p>

        <p className="mt-3 text-xs text-slate-500">
          Created:{" "}
          {task.createdAt
            ? new Date(
                task.createdAt
              ).toLocaleString()
            : "Not available"}
        </p>
      </div>

      <div className="mt-5">
        {isEditing ? (
          <EditTaskForm
            task={task}
            projectId={id}
            onClose={() => setIsEditing(false)}
          />
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Edit Task
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending
                ? "Deleting..."
                : "Delete Task"}
            </button>
          </div>
        )}

        {deleteMutation.isError && (
          <p className="text-red-500 mt-2">
            Failed to delete task. Please try again.
          </p>
        )}
      </div>

      {/* Pass the assigned employee ID */}
      <TaskComments
        taskId={taskId}
        assigneeId={task.assigneeId}
      />
    </div>
  );
}

export default TaskDetails;
