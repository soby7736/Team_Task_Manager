
import { useSelector } from "react-redux";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateTaskStatus } from "../services/taskService";
import TaskComments from "../components/TaskComments";

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

const statusColors = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
};

function MyTasks() {
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["my-tasks", user?.id],

    queryFn: async () => {
      const allTasks = JSON.parse(
        localStorage.getItem("task_manager_tasks") || "[]"
      );

      return allTasks.filter(
        (task) =>
          String(task.assigneeId) === String(user.id)
      );
    },

    enabled: !!user?.id,
    refetchOnMount: "always",
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, projectId, newStatus }) =>
      updateTaskStatus(
        taskId,
        newStatus,
        projectId,
        user
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-tasks", user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["task-activity"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  function handleStatusChange(task, newStatus) {
    if (task.status === newStatus) return;

    statusMutation.mutate({
      taskId: task.id,
      projectId: task.projectId,
      newStatus,
    });
  }

  const stats = [
    {
      label: "Total",
      value: tasks.length,
      color: "text-slate-800",
    },
    {
      label: "To Do",
      value: tasks.filter((t) => t.status === "todo").length,
      color: "text-slate-600",
    },
    {
      label: "In Progress",
      value: tasks.filter(
        (t) => t.status === "in-progress"
      ).length,
      color: "text-blue-600",
    },
    {
      label: "Review",
      value: tasks.filter((t) => t.status === "review").length,
      color: "text-amber-600",
    },
    {
      label: "Done",
      value: tasks.filter((t) => t.status === "done").length,
      color: "text-green-600",
    },
  ];

  if (isLoading) {
    return <p className="p-4">Loading tasks...</p>;
  }

  if (isError) {
    return (
      <p className="p-4 text-red-600">
        Failed to load tasks.
      </p>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            My Assigned Tasks
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage your tasks and comments
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Small statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-xl p-3"
          >
            <p className="text-xs text-slate-500">
              {stat.label}
            </p>

            <p
              className={`text-xl font-bold mt-1 ${stat.color}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">
            Assigned Tasks
          </h2>

          <span className="text-xs text-slate-500">
            {tasks.length} tasks
          </span>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            No tasks assigned yet.
          </p>
        ) : (
          <div className="max-h-[650px] overflow-y-auto pr-1 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-slate-200 rounded-xl p-4"
              >
                {/* Task heading */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {task.title}
                  </h3>

                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      statusColors[task.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusLabels[task.status] ||
                      task.status}
                  </span>
                </div>

                {/* Side-by-side layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left: task information */}
                  <div className="bg-slate-50 rounded-lg p-3 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      Task Details
                    </p>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {task.description ||
                        "No description provided"}
                    </p>

                    <label
                      htmlFor={`status-${task.id}`}
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Update Status
                    </label>

                    <select
                      id={`status-${task.id}`}
                      value={task.status}
                      onChange={(event) =>
                        handleStatusChange(
                          task,
                          event.target.value
                        )
                      }
                      disabled={statusMutation.isPending}
                      className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">
                        In Progress
                      </option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>

                    <p className="text-[11px] text-slate-400 mt-3">
                      Created:{" "}
                      {task.createdAt
                        ? new Date(
                            task.createdAt
                          ).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>

                  {/* Right: comments */}
                  <div className="min-w-0">
                    <TaskComments
                      taskId={task.id}
                      assigneeId={task.assigneeId}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {statusMutation.isError && (
        <p className="text-sm text-red-600">
          {statusMutation.error?.message ||
            "Failed to update task status."}
        </p>
      )}

      {statusMutation.isSuccess && (
        <p className="text-sm text-green-600">
          Task status updated successfully!
        </p>
      )}
    </div>
  );
}

export default MyTasks;
