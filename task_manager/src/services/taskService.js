
const STORAGE_KEY = "task_manager_tasks";
const ACTIVITY_KEY = "task_manager_activity";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Save task status activity
function saveTaskActivity(activity) {
  const activities = JSON.parse(
    localStorage.getItem(ACTIVITY_KEY) || "[]"
  );

  const newActivity = {
    id: crypto.randomUUID(),
    ...activity,
    createdAt: new Date().toISOString(),
  };

  activities.unshift(newActivity);

  localStorage.setItem(
    ACTIVITY_KEY,
    JSON.stringify(activities)
  );

  return newActivity;
}

// Get task activity history
export async function getTaskActivities() {
  await delay(200);

  const activities = JSON.parse(
    localStorage.getItem(ACTIVITY_KEY) || "[]"
  );

  return activities.sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  );
}

// Create task
export async function createTask(taskData, projectId) {
  await delay(400);

  const tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  if (
    taskData.assigneeId === undefined ||
    taskData.assigneeId === null ||
    String(taskData.assigneeId).trim() === ""
  ) {
    throw new Error("Please select an employee");
  }

  const now = new Date().toISOString();

  const newTask = {
    id: crypto.randomUUID(),
    projectId,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    assigneeId: String(taskData.assigneeId),
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );

  return newTask;
}

// Get tasks by project
export async function getTasks(projectId) {
  await delay(400);

  const tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  return tasks.filter(
    (task) => task.projectId === projectId
  );
}

// Update task status and record activity
export async function updateTaskStatus(
  taskId,
  newStatus,
  projectId,
  updatedBy = null
) {
  await delay(400);

  const validStatuses = [
    "todo",
    "in-progress",
    "review",
    "done",
  ];

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

  const oldTask = tasks[taskIndex];

  // Avoid duplicate activity when status is unchanged
  if (oldTask.status === newStatus) {
    return oldTask;
  }

  // Employee can update only their assigned task
  if (
    updatedBy &&
    String(oldTask.assigneeId) !== String(updatedBy.id)
  ) {
    throw new Error(
      "You can only update tasks assigned to you"
    );
  }

  const updatedTask = {
    ...oldTask,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );

  // Record the activity
  saveTaskActivity({
    taskId: oldTask.id,
    projectId: oldTask.projectId,
    taskTitle: oldTask.title,
    oldStatus: oldTask.status,
    newStatus,
    updatedById: updatedBy?.id ?? null,
    updatedByName: updatedBy
      ? `${updatedBy.firstName || ""} ${
          updatedBy.lastName || ""
        }`.trim()
      : "Admin / Unknown",
  });

  return updatedTask;
}

// Get a single task
export async function getTaskById(taskId, projectId) {
  await delay(400);

  const tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const task = tasks.find(
    (item) =>
      item.id === taskId &&
      item.projectId === projectId
  );

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
}

// Update task details
export async function updateTask(
  taskId,
  projectId,
  updatedData
) {
  await delay(400);

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
    title: updatedData.title,
    description: updatedData.description,
    status: updatedData.status,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );

  return updatedTask;
}

// Delete task
export async function deleteTask(taskId, projectId) {
  await delay(400);

  const tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const taskExists = tasks.some(
    (task) =>
      task.id === taskId &&
      task.projectId === projectId
  );

  if (!taskExists) {
    throw new Error("Task not found");
  }

  const remainingTasks = tasks.filter(
    (task) =>
      !(
        task.id === taskId &&
        task.projectId === projectId
      )
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(remainingTasks)
  );

  return { success: true };
}

// Update task assignee
export async function updateTaskAssignee(
  taskId,
  projectId,
  assigneeId
) {
  await delay(400);

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
    assigneeId:
      assigneeId === undefined ||
      assigneeId === null ||
      String(assigneeId).trim() === ""
        ? null
        : String(assigneeId),
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );

  return updatedTask;
}
export const getTaskActivity = getTaskActivities;