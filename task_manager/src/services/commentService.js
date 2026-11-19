
const STORAGE_KEY = "task_manager_comments";
const TASK_STORAGE_KEY = "task_manager_tasks";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Get comments for a specific task
export async function getComments(taskId) {
  await delay(400);

  const comments = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  return comments.filter(
    (comment) =>
      String(comment.taskId) === String(taskId)
  );
}

// Add a new comment
export async function createComment(taskId, text, user) {
  await delay(400);

  // Step 1: Check logged-in user
  if (!user || user.id == null) {
    throw new Error("Please log in to comment.");
  }

  // Step 2: Validate comment text
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Comment cannot be empty.");
  }

  // Step 3: Get tasks from localStorage
  const tasks = JSON.parse(
    localStorage.getItem(TASK_STORAGE_KEY) || "[]"
  );

  // Step 4: Find the task
  const task = tasks.find(
    (item) => String(item.id) === String(taskId)
  );

  if (!task) {
    throw new Error("Task not found.");
  }

  // Step 5: Check whether the user is assigned
  const isAssignedEmployee =
    task.assigneeId != null &&
    String(task.assigneeId) === String(user.id);

  if (!isAssignedEmployee) {
    throw new Error(
      "Only the assigned employee can comment on this task."
    );
  }

  // Step 6: Read existing comments
  const comments = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  // Step 7: Create comment
  const newComment = {
    id: crypto.randomUUID(),
    taskId: task.id,
    text: text.trim(),
    authorId: user.id,
    authorName:
      [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") ||
      user.username ||
      "Unknown User",
    createdAt: new Date().toISOString(),
  };

  // Step 8: Save comment
  comments.push(newComment);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(comments)
  );

  return newComment;
}
