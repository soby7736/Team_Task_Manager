
const STORAGE_KEY = "task_manager_tasks";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function createTask(taskData, projectId) {
  await delay(400);

  const tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const newTask = {
    id: crypto.randomUUID(),
    projectId,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );

  return newTask;
}

export async function getTasks(projectId) {
  await delay(400);

  const tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  return tasks.filter(
    (task) => task.projectId === projectId
  );
}

export async function updateTaskStatus(taskId, newStatus, projectId) {
  await delay(400);

  const validStatuses = ["todo", "in-progress", "done"];

  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid task status");
  }

  const tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const taskIndex = tasks.findIndex(
    (task) =>
      task.id === taskId &&
      task.projectId === projectId
  );

  if (taskIndex === -1) {
    throw new Error("Task not found");
  }

  const updatedTask = {
    ...tasks[taskIndex],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );

  return updatedTask;
}
