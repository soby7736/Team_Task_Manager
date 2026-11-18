
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

function ProjectDetails() {
  // Step 1: Get project ID
  const { id } = useParams();

  // Step 2: Get logged-in user
  const user = useSelector((state) => state.auth.user);

  // Step 3: Get Query Client
  const queryClient = useQueryClient();

  // Step 4: Fetch project
  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", id, user?.id],
    queryFn: () => getProjectById(id, user.id),
    enabled: !!id && !!user?.id,
  });

  // Step 5: Fetch tasks
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => getTasks(id),
    enabled: !!id && !!project,
  });

  // Step 6: Mutation to update task status
  const statusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }) =>
      updateTaskStatus(taskId, newStatus, id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", id],
      });
    },
  });

  // Step 7: Handle drag and drop
  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || statusMutation.isPending) return;

    const taskId = active.id;
    const newStatus = over.id;

    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task || task.status === newStatus) {
      return;
    }

    statusMutation.mutate({
      taskId,
      newStatus,
    });
  }

  // Step 8: Define Kanban columns
  const columns = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  // Step 9: Conditional rendering
  if (isLoading) {
    return <p>Loading project...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        Project not found or failed to load.
      </p>
    );
  }

  if (!project) {
    return <p>Project not available.</p>;
  }

  return (
    <div>
      <Link
        to="/projects"
        className="text-blue-600 hover:underline"
      >
        ← Back to Projects
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mt-5">
        {project.name}
      </h1>

      <p className="text-gray-600 mt-2 mb-8">
        {project.description}
      </p>

      {/* Create Task */}
      <TaskForm projectId={id} />

      {/* Loading and error handling */}
      {tasksLoading && <p>Loading tasks...</p>}

      {tasksError && (
        <p className="text-red-500">
          Failed to load tasks.
        </p>
      )}

      {statusMutation.isError && (
        <p className="text-red-600 mb-3">
          Failed to update task status.
        </p>
      )}

      {/* Drag and Drop Kanban Board */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.id
            );

            return (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

export default ProjectDetails;
