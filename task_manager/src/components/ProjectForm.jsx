
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { projectSchema } from "../schemas/projectSchema";
import { createProject } from "../services/projectService";

function ProjectForm() {
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(data) {
    setMessage("");
    setMessageType("");

    try {
      if (!user?.id) {
        throw new Error("Please log in first.");
      }

      await createProject(data, user.id);

      await queryClient.invalidateQueries({
        queryKey: ["projects", user.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setMessage("Project created successfully!");
      setMessageType("success");
      reset();
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "Failed to create project."
      );
      setMessageType("error");
    }
  }

  return (
    <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 flex items-center justify-center bg-blue-50 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
            aria-hidden="true"
          >
            <path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z" />
            <path d="M12 11v6" />
            <path d="M9 14h6" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Create New Project
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Organize your work in one place.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 mb-5" />

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Project name */}
        <div>
          <label
            htmlFor="project-name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Project Name
            <span className="text-red-500 ml-1">*</span>
          </label>

          <input
            id="project-name"
            type="text"
            {...register("name")}
            placeholder="e.g. Website Redesign"
            aria-invalid={!!errors.name}
            className={`w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
              errors.name
                ? "border-red-400"
                : "border-slate-200"
            }`}
          />

          {errors.name && (
            <p className="text-xs text-red-500 mt-1.5">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="project-description"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Description
            <span className="text-red-500 ml-1">*</span>
          </label>

          <textarea
            id="project-description"
            {...register("description")}
            placeholder="Briefly describe your project..."
            rows={3}
            aria-invalid={!!errors.description}
            className={`w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
              errors.description
                ? "border-red-400"
                : "border-slate-200"
            }`}
          />

          {errors.description && (
            <p className="text-xs text-red-500 mt-1.5">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className={`text-xs rounded-lg px-3 py-2.5 ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              reset();
              setMessage("");
              setMessageType("");
            }}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {!isSubmitting && (
              <span className="text-lg leading-none">
                +
              </span>
            )}

            {isSubmitting
              ? "Creating..."
              : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectForm;
