
const STORAGE_KEY = "task_manager_projects";

// Simulate a small API delay
const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function createProject(projectData, userId) {
  await delay(400);

  const projects = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const newProject = {
    id: crypto.randomUUID(),
    name: projectData.name,
    description: projectData.description,
    ownerId: userId,
    createdAt: new Date().toISOString(),
  };

  projects.push(newProject);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects)
  );

  return newProject;
}
export async function getProjects(userId) {
  await delay(400);

  const projects = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  return projects.filter(
    (project) => String(project.ownerId) === String(userId)
  );
}


export async function updateProject(projectId, updatedData, userId) {
  await delay(400);

  const projects = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const projectIndex = projects.findIndex(
    (project) =>
      project.id === projectId &&
      String(project.ownerId) === String(userId)
  );

  if (projectIndex === -1) {
    throw new Error("Project not found");
  }

  const updatedProject = {
    ...projects[projectIndex],
    name: updatedData.name,
    description: updatedData.description,
    updatedAt: new Date().toISOString(),
  };

  projects[projectIndex] = updatedProject;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects)
  );

  return updatedProject;
}

export async function deleteProject(projectId, userId) {
  await delay(400);

  const projects = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const projectExists = projects.some(
    (project) =>
      project.id === projectId &&
      String(project.ownerId) === String(userId)
  );

  if (!projectExists) {
    throw new Error("Project not found");
  }

  const remainingProjects = projects.filter(
    (project) =>
      !(
        project.id === projectId &&
        String(project.ownerId) === String(userId)
      )
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(remainingProjects)
  );

  return true;
}

export async function getProjectById(projectId, userId) {
  await delay(400);

  const projects = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const project = projects.find(
    (item) =>
      item.id === projectId &&
      String(item.ownerId) === String(userId)
  );

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}


