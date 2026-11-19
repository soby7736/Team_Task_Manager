
import { useState } from "react";
import { DndContext } from "@dnd-kit/core";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import TaskForm from "../components/TaskForm";
import DroppableColumn from "../components/DroppableColumn";

import {
  getTasks,
  updateTaskStatus,
} from "../services/taskService";

import { getProjectById } from "../services/projectService";
import { getMembers } from "../services/memberService";

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

function ProjectDetails() {
  const { id } = useParams();

  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Fetch project
  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", id, user?.id],
    queryFn: () => getProjectById(id, user.id),
    enabled: !!id && !!user?.id,
  });

  // Fetch project tasks
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => getTasks(id),
    enabled: !!id && !!project,
  });

  // Fetch members
  const {
    data: members = [],
    isLoading: membersLoading,
    isError: membersError,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  // Update task status
  const statusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }) =>
      updateTaskStatus(taskId, newStatus, id, user),

    // Optimistic update
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries({
        queryKey: ["tasks", id],
      });

      const previousTasks = queryClient.getQueryData([
        "tasks",
        id,
      ]);

      queryClient.setQueryData(
        ["tasks", id],
        (oldTasks = []) =>
          oldTasks.map((task) =>
            String(task.id) === String(taskId)
              ? { ...task, status: newStatus }
              : task
          )
      );

      return { previousTasks };
    },

    // Rollback if update fails
    onError: (error, variables, context) => {
      if (context?.previousTasks !== undefined) {
        queryClient.setQueryData(
          ["tasks", id],
          context.previousTasks
        );
      }

      console.error("Failed to update task:", error);
    },

    // Refresh related data
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["tasks", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-tasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["task-activity"],
        }),
      ]);
    },
  });

  // Handle drag and drop
  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || statusMutation.isPending) return;

    const taskId = active.id;
    const newStatus = over.id;

    const validStatus = columns.some(
      (column) => column.id === newStatus
    );

    if (!validStatus) return;

    const task = tasks.find(
      (item) => String(item.id) === String(taskId)
    );

    if (!task || task.status === newStatus) return;

    statusMutation.mutate({
      taskId,
      newStatus,
    });
  }

  // Search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = (task.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      task.status === statusFilter;

    const matchesAssignee =
      assigneeFilter === "all" ||
      (assigneeFilter === "unassigned"
        ? task.assigneeId == null ||
          task.assigneeId === ""
        : String(task.assigneeId) === assigneeFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesAssignee
    );
  });

  function handleClearFilters() {
    setSearch("");
    setStatusFilter("all");
    setAssigneeFilter("all");
  }

  if (isLoading) {
    return (
      <p className="p-4 text-sm text-slate-500">
        Loading project...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="p-4 text-sm text-red-600">
        Project not found or failed to load.
      </p>
    );
  }

  if (!project) {
    return (
      <p className="p-4 text-sm text-slate-500">
        Project not available.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Project header */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <Link
          to="/projects"
          className="text-xs text-blue-600 hover:underline"
        >
          ← Back to Projects
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-800">
              {project.name}
            </h1>

            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {project.description ||
                "Manage project tasks and progress"}
            </p>
          </div>

          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {tasks.length} Tasks
          </span>
        </div>
      </div>

      {/* TOP: Form on left, filters on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* LEFT: Create Task */}
        <section className="min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">
              Create Task
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add a task to this project
            </p>
          </div>

          <div className="p-3 sm:p-4 max-h-[350px] overflow-y-auto">
            <TaskForm projectId={id} />
          </div>
        </section>

        {/* RIGHT: Filters */}
        <section className="min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">
              Search & Filters
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Find tasks quickly
            </p>
          </div>

          <div className="p-4 space-y-3">
            {/* Search */}
            <div>
              <label
                htmlFor="task-search"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Search by Title
              </label>

              <input
                id="task-search"
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status filter */}
            <div>
              <label
                htmlFor="status-filter"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Filter by Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">
                  In Progress
                </option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Assignee filter */}
            <div>
              <label
                htmlFor="assignee-filter"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Filter by Employee
              </label>

              <select
                id="assignee-filter"
                value={assigneeFilter}
                onChange={(event) =>
                  setAssigneeFilter(event.target.value)
                }
                disabled={membersLoading || membersError}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="all">All Assignees</option>
                <option value="unassigned">
                  Unassigned
                </option>

                {members.map((member) => (
                  <option
                    key={member.id}
                    value={String(member.id)}
                  >
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>

              {membersLoading && (
                <p className="text-xs text-slate-500 mt-1">
                  Loading employees...
                </p>
              )}

              {membersError && (
                <p className="text-xs text-red-500 mt-1">
                  Failed to load employees.
                </p>
              )}
            </div>

            {/* Filter footer */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing {filteredTasks.length} of{" "}
                {tasks.length} tasks
              </p>

              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* BOTTOM: Kanban board */}
      <section className="min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Task Board
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Drag tasks between status columns
            </p>
          </div>

          <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-1">
            {filteredTasks.length} visible
          </span>
        </div>

        {tasksLoading && (
          <p className="p-4 text-sm text-slate-500">
            Loading tasks...
          </p>
        )}

        {tasksError && (
          <p className="p-4 text-sm text-red-600">
            Failed to load tasks.
          </p>
        )}

        {statusMutation.isError && (
          <p className="px-4 pt-3 text-xs text-red-600">
            Failed to update task status.
          </p>
        )}

        {!tasksLoading &&
          !tasksError &&
          filteredTasks.length === 0 &&
          tasks.length > 0 && (
            <p className="px-4 pt-3 text-xs text-slate-500">
              No tasks match your filters.
            </p>
          )}

        {/* Scrollable Kanban board */}
        <div className="overflow-auto p-3 sm:p-4 max-h-[500px]">
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
              {columns.map((column) => {
                const columnTasks = filteredTasks.filter(
                  (task) =>
                    task.status === column.id
                );

                return (
                  <div key={column.id} className="min-w-0">
                    <DroppableColumn
                      column={column}
                      tasks={columnTasks}
                    />
                  </div>
                );
              })}
            </div>
          </DndContext>
        </div>
      </section>
    </div>
  );
}

export default ProjectDetails;
