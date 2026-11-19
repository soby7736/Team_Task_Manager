
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { taskSchema } from "../schemas/taskSchema";
import { createTask } from "../services/taskService";
import { getMembers } from "../services/memberService";

function TaskForm({ projectId }) {
  const queryClient = useQueryClient();

  // Fetch employees from DummyJSON
  const {
    data: members = [],
    isLoading: membersLoading,
    isError: membersError,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

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
      assigneeId: "",
    },
  });

  const taskMutation = useMutation({
    mutationFn: (data) =>
      createTask(data, projectId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
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

      {/* Task Title */}
      <label className="block mb-2 font-medium">
        Task Title
      </label>

      <input
        {...register("title")}
        placeholder="Enter task title"
        className="border p-3 rounded-lg w-full mb-2"
      />

      {errors.title && (
        <p className="text-red-500 text-sm mb-3">
          {errors.title.message}
        </p>
      )}

      {/* Description */}
      <label className="block mb-2 font-medium mt-3">
        Description
      </label>

      <textarea
        {...register("description")}
        placeholder="Enter task description"
        className="border p-3 rounded-lg w-full mb-2"
      />

      {errors.description && (
        <p className="text-red-500 text-sm mb-3">
          {errors.description.message}
        </p>
      )}

      {/* Task Status */}
      <label className="block mb-2 font-medium mt-3">
        Task Status
      </label>

      <select
        {...register("status")}
        className="border p-3 rounded-lg w-full mb-2"
      >
        <option value="todo">To Do</option>
        <option value="in-progress">
          In Progress
        </option>
        <option value="review">Review</option>
        <option value="done">Done</option>
      </select>

      {errors.status && (
        <p className="text-red-500 text-sm mb-3">
          {errors.status.message}
        </p>
      )}

      {/* Employee Assignment */}
      <label className="block mb-2 font-medium mt-3">
        Assign Employee
      </label>

      <select
        {...register("assigneeId")}
        disabled={membersLoading || membersError}
        className="border p-3 rounded-lg w-full mb-2 disabled:opacity-50"
      >
        <option value="">
          {membersLoading
            ? "Loading employees..."
            : "Select an employee"}
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

      {errors.assigneeId && (
        <p className="text-red-500 text-sm mb-3">
          {errors.assigneeId.message}
        </p>
      )}

      {membersError && (
        <p className="text-red-500 text-sm mb-3">
          Failed to load employees.
        </p>
      )}

      {/* Submission Error */}
      {taskMutation.isError && (
        <p className="text-red-500 mb-3">
          Failed to create task. Please try again.
        </p>
      )}

      {/* Create Button */}
      <button
        type="submit"
        disabled={
          taskMutation.isPending ||
          membersLoading ||
          membersError
        }
        className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {taskMutation.isPending
          ? "Creating..."
          : "Create Task"}
      </button>
    </form>
  );
}

export default TaskForm;
