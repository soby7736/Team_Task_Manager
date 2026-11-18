import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { useState } from "react";

import { projectSchema } from "../schemas/projectSchema";
import { createProject } from "../services/projectService";
import { useQueryClient } from "@tanstack/react-query";

function ProjectForm() {
  const user = useSelector((state) => state.auth.user);

  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
  });

  async function onSubmit(data) {
    setMessage("");

    try {
      await createProject(data, user.id);

      await queryClient.invalidateQueries({
        queryKey: ["projects", user.id],
      });

      setMessage("Project created successfully!");
      reset();
    } catch (error) {
      console.error(error);
      setMessage("Failed to create project.");
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-lg">
      <h2 className="text-2xl font-bold mb-5">Create New Project</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block mb-2">Project Name</label>

        <input
          {...register("name")}
          placeholder="Enter project name"
          className="w-full border p-3 rounded mb-2"
        />

        {errors.name && (
          <p className="text-red-500 mb-3">{errors.name.message}</p>
        )}

        <label className="block mb-2">Description</label>

        <textarea
          {...register("description")}
          placeholder="Enter project description"
          className="w-full border p-3 rounded mb-2"
        />

        {errors.description && (
          <p className="text-red-500 mb-3">{errors.description.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Project"}
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
      </form>
    </div>
  );
}

export default ProjectForm;
