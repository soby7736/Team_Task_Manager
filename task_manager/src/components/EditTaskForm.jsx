
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskSchema } from "../schemas/taskSchema";
import { updateTask } from "../services/taskService";

function EditTaskForm({ task, projectId, onClose }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      status: task.status,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      updateTask(task.id, projectId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["task", projectId, task.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks", projectId],
      });

      onClose();
    },
  });

  function onSubmit(data) {
    updateMutation.mutate(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-xl shadow mt-5"
    >
      <h2 className="text-xl font-bold mb-4">
        Edit Task
      </h2>

      <div className="mb-4">
        <label className="block mb-1">Title</label>
        <input
          {...register("title")}
          className="w-full border rounded p-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Description</label>
        <textarea
          {...register("description")}
          className="w-full border rounded p-2"
        />
        {errors.description && (
          <p className="text-red-500 text-sm">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Status</label>
        <select
          {...register("status")}
          className="w-full border rounded p-2"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        {errors.status && (
          <p className="text-red-500 text-sm">
            {errors.status.message}
          </p>
        )}
      </div>

      {updateMutation.isError && (
        <p className="text-red-500 mb-3">
          Failed to update task.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditTaskForm;
