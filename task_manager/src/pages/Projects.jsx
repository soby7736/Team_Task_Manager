
import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import ProjectForm from "../components/ProjectForm";

import {
  getProjects,
  updateProject,
  deleteProject,
} from "../services/projectService";

function Projects() {
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const [editingProject, setEditingProject] =
    useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] =
    useState("");

  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => getProjects(user.id),
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      updateProject(id, data, user.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", user.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      setEditingProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      deleteProject(id, user.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", user.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });

  function handleEdit(project) {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
  }

  function handleUpdate(event) {
    event.preventDefault();

    const name = editName.trim();
    const description = editDescription.trim();

    if (name.length < 3 || description.length < 5) {
      return;
    }

    updateMutation.mutate({
      id: editingProject.id,
      data: { name, description },
    });
  }

  function handleDelete(id) {
    if (window.confirm("Delete this project?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Page Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">
          Project Management
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Create and manage your projects
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0 lg:h-[calc(100vh-190px)]">

        {/* LEFT SIDE: CREATE PROJECT */}
        <div className="min-w-0 lg:overflow-y-auto">
          <ProjectForm />
        </div>

        {/* RIGHT SIDE: SAVED PROJECTS */}
        <div className="min-w-0 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">

          {/* Fixed Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Saved Projects
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                All your created projects
              </p>
            </div>

            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {projects.length} Projects
            </span>
          </div>

          {/* Independently scrollable projects */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 max-h-[520px] lg:max-h-none">

            {isLoading && (
              <p className="text-sm text-slate-500">
                Loading projects...
              </p>
            )}

            {isError && (
              <p className="text-sm text-red-600">
                Failed to load projects.
              </p>
            )}

            {!isLoading &&
              !isError &&
              projects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-500">
                    No projects created yet.
                  </p>

                  <p className="text-xs text-slate-400 mt-2">
                    Create your first project using the form
                    on the left.
                  </p>
                </div>
              )}

            {updateMutation.isError && (
              <p className="text-sm text-red-600">
                Failed to update project.
              </p>
            )}

            {deleteMutation.isError && (
              <p className="text-sm text-red-600">
                Failed to delete project.
              </p>
            )}

            {!isLoading &&
              !isError &&
              projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  {editingProject?.id === project.id ? (

                    /* Edit Project */
                    <form
                      onSubmit={handleUpdate}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-slate-800">
                        Edit Project
                      </h3>

                      <input
                        value={editName}
                        onChange={(event) =>
                          setEditName(event.target.value)
                        }
                        minLength={3}
                        required
                        placeholder="Project name"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <textarea
                        value={editDescription}
                        onChange={(event) =>
                          setEditDescription(
                            event.target.value
                          )
                        }
                        minLength={5}
                        required
                        rows={2}
                        placeholder="Project description"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={updateMutation.isPending}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updateMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject(null)
                          }
                          className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (

                    /* Project Card */
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-lg">
                          📁
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-slate-800 break-words">
                            {project.name}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 break-words">
                            {project.description ||
                              "No description provided"}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <Link
                          to={`/projects/${project.id}`}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700"
                        >
                          View Project
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(project)
                          }
                          className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs hover:bg-slate-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(project.id)
                          }
                          disabled={deleteMutation.isPending}
                          className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs hover:bg-red-100 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;
