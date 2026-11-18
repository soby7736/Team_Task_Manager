import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import ProjectForm from "../components/ProjectForm";
import {
  getProjects,
  updateProject,
  deleteProject,
} from "../services/projectService";

function Projects() {
  const user = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

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
    mutationFn: ({ id, data }) => updateProject(id, data, user.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", user.id],
      });

      setEditingProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProject(id, user.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", user.id],
      });
    },
  });

  function handleEdit(project) {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description);
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
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Projects</h1>

      <ProjectForm />

      <h2 className="text-2xl font-bold mt-10 mb-4">Saved Projects</h2>

      {isLoading && <p>Loading projects...</p>}

      {isError && <p className="text-red-500">Failed to load projects.</p>}

      {!isLoading && !isError && projects.length === 0 && (
        <p>No projects found.</p>
      )}

      {updateMutation.isError && (
        <p className="text-red-600 mb-3">Failed to update project.</p>
      )}

      {deleteMutation.isError && (
        <p className="text-red-600 mb-3">Failed to delete project.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-5 rounded-xl shadow">
            {editingProject?.id === project.id ? (
              <form onSubmit={handleUpdate}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-2 w-full mb-3"
                  minLength={3}
                  required
                />

                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border p-2 w-full mb-3"
                  minLength={5}
                  required
                />

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800">
                  {project.name}
                </h3>

                <p className="text-gray-600 mt-2">{project.description}</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleEdit(project)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/projects/${project.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    View Project
                  </Link>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
