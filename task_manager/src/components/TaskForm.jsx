
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { taskSchema } from "../schemas/taskSchema";
import { createTask } from "../services/taskService";

function TaskForm({ projectId }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),

    defaultValues: {
      title: "",
      description: "",
      status: "todo",
    },
  });

  const taskMutation = useMutation({
    mutationFn: (data) => createTask(data, projectId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", projectId],
      });

      reset();
    },
  });

  function onSubmit(data) {
    taskMutation.mutate(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-5 rounded-xl shadow mb-8"
    >
      <h2 className="text-xl font-bold mb-4">
        Create New Task
      </h2>

      <input
        {...register("title")}
        placeholder="Task title"
        className="border p-2 rounded w-full mb-2"
      />

      {errors.title && (
        <p className="text-red-500 text-sm mb-3">
          {errors.title.message}
        </p>
      )}

      <textarea
        {...register("description")}
        placeholder="Task description"
        className="border p-2 rounded w-full mb-2"
      />

      {errors.description && (
        <p className="text-red-500 text-sm mb-3">
          {errors.description.message}
        </p>
      )}

      <select
        {...register("status")}
        className="border p-2 rounded w-full mb-2"
      >
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      {errors.status && (
        <p className="text-red-500 text-sm mb-3">
          {errors.status.message}
        </p>
      )}

      {taskMutation.isError && (
        <p className="text-red-500 mb-3">
          Failed to create task. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={taskMutation.isPending}
        className="bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-50"
      >
        {taskMutation.isPending
          ? "Creating..."
          : "Create Task"}
      </button>
    </form>
  );
}

export default TaskForm;
