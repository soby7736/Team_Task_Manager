import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getMembers } from "../services/memberService";
import { updateTaskAssignee } from "../services/taskService";

function TaskAssignee({ task, projectId }) {
  const queryClient = useQueryClient();

  // Fetch 10 users
  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  // Save the selected assignee
  const assigneeMutation = useMutation({
    mutationFn: (assigneeId) =>
      updateTaskAssignee(task.id, projectId, assigneeId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["task", projectId, task.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks", projectId],
      });
    },
  });

  const selectedMember = members.find(
    (member) => String(member.id) === String(task.assigneeId),
  );

  if (isLoading) {
    return <p>Loading users...</p>;
  }

  if (isError) {
    return <p className="text-red-500">Failed to load users.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Task Assignee</h2>

      <label className="block mb-2">Assign task to</label>

      <select
        value={task.assigneeId ?? ""}
        onChange={(event) =>
          assigneeMutation.mutate(event.target.value || null)
        }
        disabled={assigneeMutation.isPending}
        className="w-full border rounded-lg p-3"
      >
        <option value="">Unassigned</option>

        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.firstName} {member.lastName}
          </option>
        ))}
      </select>
      {assigneeMutation.isPending && (
        <p className="text-gray-500 mt-2">Saving assignee...</p>
      )}

      {assigneeMutation.isError && (
        <p className="text-red-500 mt-2">Failed to assign task.</p>
      )}

      <div className="mt-5">
        <p className="font-semibold mb-2">Currently Assigned To:</p>

        {selectedMember ? (
          <div className="flex items-center gap-3">
            <img
              src={selectedMember.image}
              alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
              className="w-12 h-12 rounded-full"
            />

            <div>
              <p className="font-medium">
                {selectedMember.firstName} {selectedMember.lastName}
              </p>

              <p className="text-gray-500 text-sm">{selectedMember.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No user assigned.</p>
        )}
      </div>
    </div>
  );
}

export default TaskAssignee;
