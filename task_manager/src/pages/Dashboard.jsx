
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getProjects } from "../services/projectService";
import {
  getTasks,
  getTaskActivities,
} from "../services/taskService";
import { getMembers } from "../services/memberService";

const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

const STATUS_STYLES = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
};

const COMMENT_STORAGE_KEY = "task_manager_comments";

// Show a comment with a status update only when
// the same employee posted it shortly afterward.
const COMMENT_WINDOW_MS = 5 * 60 * 1000;

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "Date unavailable";
  }

  return new Date(value).toLocaleString();
}

function readStoredComments() {
  try {
    const comments = JSON.parse(
      localStorage.getItem(COMMENT_STORAGE_KEY) || "[]"
    );

    return Array.isArray(comments) ? comments : [];
  } catch {
    return [];
  }
}

function findRelatedComments(history, comments) {
  const result = {};
  const usedCommentIds = new Set();

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const sortedComments = [...comments].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  );

  for (const entry of sortedHistory) {
    const changeTime = new Date(entry.createdAt).getTime();

    if (!Number.isFinite(changeTime)) continue;

    const matchingComment = sortedComments.find((comment) => {
      if (usedCommentIds.has(comment.id)) return false;

      const commentTime = new Date(
        comment.createdAt
      ).getTime();

      const sameTask =
        String(comment.taskId) === String(entry.taskId);

      const sameEmployee =
        entry.updatedById != null &&
        comment.authorId != null &&
        String(comment.authorId) ===
          String(entry.updatedById);

      const timeDifference = commentTime - changeTime;

      return (
        sameTask &&
        sameEmployee &&
        Number.isFinite(commentTime) &&
        timeDifference >= 0 &&
        timeDifference <= COMMENT_WINDOW_MS
      );
    });

    if (matchingComment) {
      result[entry.id] = matchingComment;
      usedCommentIds.add(matchingComment.id);
    }
  }

  return result;
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-2 min-w-0">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 truncate">
          {title}
        </p>

        <p className={`text-2xl font-bold mt-1 ${color}`}>
          {value}
        </p>
      </div>

      <span aria-hidden="true" className="text-2xl shrink-0">
        {icon}
      </span>
    </div>
  );
}

function Panel({ title, subtitle, children, action }) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 min-w-0 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-800 text-base">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function TaskActivityCard({ task, members }) {
  const assignee = members.find(
    (member) =>
      String(member.id) === String(task.assigneeId)
  );

  const assigneeName = assignee
    ? `${assignee.firstName} ${assignee.lastName}`
    : "Unassigned";

  return (
    <Link
      to={`/projects/${task.projectId}/tasks/${task.id}`}
      className="block border border-gray-100 rounded-lg p-3 hover:bg-blue-50 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm text-gray-800 break-words min-w-0">
          {task.title}
        </p>

        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${
            STATUS_STYLES[task.status] ||
            STATUS_STYLES.todo
          }`}
        >
          {STATUS_LABELS[task.status] || task.status}
        </span>
      </div>

      <p className="text-xs text-gray-600 mt-1">
        Assigned to: {assigneeName}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        {formatDate(task.createdAt)}
      </p>
    </Link>
  );
}

function HistoryCard({ entry, comment }) {
  return (
    <div className="border border-gray-100 rounded-lg px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">
          {entry.updatedByName || "Unknown employee"}
        </p>

        <span className="text-[11px] text-gray-400">
          {formatDate(entry.createdAt)}
        </span>
      </div>

      <p className="text-xs text-gray-600 mt-1 break-words">
        Updated{" "}
        <span className="font-medium">
          {entry.taskTitle || "Task"}
        </span>
      </p>

      {/* Compact status change */}
      <div className="flex items-center flex-wrap gap-2 mt-2 text-xs">
        <span
          className={`rounded px-2 py-1 ${
            STATUS_STYLES[entry.oldStatus] ||
            STATUS_STYLES.todo
          }`}
        >
          {STATUS_LABELS[entry.oldStatus] ||
            entry.oldStatus ||
            "Unknown"}
        </span>

        <span className="text-gray-400">→</span>

        <span
          className={`rounded px-2 py-1 ${
            STATUS_STYLES[entry.newStatus] ||
            STATUS_STYLES.todo
          }`}
        >
          {STATUS_LABELS[entry.newStatus] ||
            entry.newStatus ||
            "Unknown"}
        </span>
      </div>

      {/* Related employee comment */}
      {comment && (
        <div className="mt-2 flex items-start gap-2 rounded-md bg-slate-50 px-2.5 py-2">
          <span
            className="text-xs shrink-0"
            aria-hidden="true"
          >
            💬
          </span>

          <div className="min-w-0">
            <p className="text-xs text-slate-700 whitespace-pre-wrap break-words">
              {comment.text}
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Commented {formatDate(comment.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch: refetchDashboard,
    isFetching: dashboardFetching,
  } = useQuery({
    queryKey: ["dashboard", user?.id],

    queryFn: async () => {
      const projects = await getProjects(user.id);

      const taskLists = await Promise.all(
        projects.map((project) => getTasks(project.id))
      );

      return {
        projects,
        tasks: taskLists.flat(),
      };
    },

    enabled: !!user?.id,
    refetchOnMount: "always",
  });

  const {
    data: members = [],
    isLoading: membersLoading,
    isError: membersError,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  const {
    data: activityHistory = [],
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
    isFetching: historyFetching,
  } = useQuery({
    queryKey: ["task-activity", user?.id],
    queryFn: getTaskActivities,
    enabled: !!user?.id,
    refetchOnMount: "always",
  });

  const {
    data: comments = [],
    refetch: refetchComments,
    isFetching: commentsFetching,
    isError: commentsError,
  } = useQuery({
    queryKey: ["dashboard-comments", user?.id],
    queryFn: readStoredComments,
    enabled: !!user?.id,
    refetchOnMount: "always",
  });

  const projects = dashboardData?.projects || [];
  const tasks = dashboardData?.tasks || [];

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const reviewTasks = tasks.filter(
    (task) => task.status === "review"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const chartData = [
    {
      name: "To Do",
      value: todoTasks,
      color: "#64748b",
    },
    {
      name: "In Progress",
      value: inProgressTasks,
      color: "#3b82f6",
    },
    {
      name: "Review",
      value: reviewTasks,
      color: "#f59e0b",
    },
    {
      name: "Done",
      value: completedTasks,
      color: "#22c55e",
    },
  ];

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 5);

  const recentHistory = [...activityHistory]
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 10);

  const commentsByHistoryId = findRelatedComments(
    activityHistory,
    comments
  );

  async function handleRefresh() {
    await Promise.all([
      refetchDashboard(),
      refetchHistory(),
      refetchComments(),
    ]);
  }

  const isRefreshing =
    dashboardFetching ||
    historyFetching ||
    commentsFetching;

  if (isLoading) {
    return (
      <p className="p-6">
        Loading dashboard...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="p-6 text-red-600">
        Failed to load dashboard data.
      </p>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-5 lg:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.firstName || "User"}!
          </h1>

          <p className="text-sm text-gray-500">
            Your projects and tasks at a glance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border border-slate-200 bg-white text-slate-700 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            to="/projects"
            className="bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700"
          >
            View Projects
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          title="Total Projects"
          value={projects.length}
          color="text-purple-600"
          icon="📁"
        />

        <StatCard
          title="Total Tasks"
          value={totalTasks}
          color="text-blue-600"
          icon="📋"
        />

        <StatCard
          title="Completed"
          value={completedTasks}
          color="text-green-600"
          icon="✅"
        />

        <StatCard
          title="In Progress"
          value={inProgressTasks}
          color="text-orange-600"
          icon="⏳"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Panel
          title="Task Status Overview"
          subtitle="Distribution of tasks across stages"
        >
          {totalTasks === 0 ? (
            <p className="text-sm text-gray-500">
              No tasks available to display.
            </p>
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={66}
                    innerRadius={35}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    iconSize={9}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel
          title="Task Completion Rate"
          subtitle="How much work is finished"
        >
          <div className="flex-1 flex flex-col justify-center py-3">
            <p className="text-center text-4xl font-bold text-green-600">
              {completionRate}%
            </p>

            <p className="text-center text-sm text-gray-500 mt-1">
              {completedTasks} of {totalTasks} tasks completed
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-5 overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all"
                style={{
                  width: `${completionRate}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mt-5 text-center">
              {chartData.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg bg-gray-50 p-2"
                >
                  <p className="text-lg font-bold text-gray-800">
                    {item.value}
                  </p>

                  <p className="text-xs text-gray-500">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Activity panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          title="🔔 Recent Task Activity"
          subtitle="Newest tasks and their assignees"
          action={
            <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1">
              {recentTasks.length} tasks
            </span>
          }
        >
          {membersLoading && (
            <p className="text-xs text-gray-500 mb-2">
              Loading employee names...
            </p>
          )}

          {membersError && (
            <p className="text-xs text-red-600 mb-2">
              Employee names unavailable.
            </p>
          )}

          <div className="h-64 overflow-y-auto space-y-2 pr-1">
            {recentTasks.length ? (
              recentTasks.map((task) => (
                <TaskActivityCard
                  key={task.id}
                  task={task}
                  members={members}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No tasks created yet.
              </p>
            )}
          </div>
        </Panel>

        <Panel
          title="📋 Task Status History"
          subtitle="Employee status updates and related comments"
          action={
            <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1">
              {activityHistory.length} changes
            </span>
          }
        >
          <div className="h-64 overflow-y-auto space-y-2 pr-1">
            {historyLoading ? (
              <p className="text-sm text-gray-500">
                Loading history...
              </p>
            ) : historyError ? (
              <p className="text-sm text-red-600">
                Unable to load task history.
              </p>
            ) : recentHistory.length ? (
              recentHistory.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  comment={
                    commentsByHistoryId[entry.id]
                  }
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No task status changes recorded yet.
              </p>
            )}
          </div>

          {commentsError && (
            <p className="text-xs text-red-600 mt-2">
              Comments could not be loaded.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default Dashboard;
