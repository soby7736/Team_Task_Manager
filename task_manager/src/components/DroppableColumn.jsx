
import { useDroppable } from "@dnd-kit/core";
import DraggableTask from "./DraggableTask";

function DroppableColumn({ column, tasks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-4 min-h-80 ${
        isOver ? "bg-blue-100" : "bg-gray-100"
      }`}
    >
      <h2 className="text-lg font-bold mb-4">
        {column.title} ({tasks.length})
      </h2>

      {tasks.map((task) => (
        <DraggableTask key={task.id} task={task} />
      ))}

      {tasks.length === 0 && (
        <p className="text-gray-400 text-sm">
          Drop tasks here
        </p>
      )}
    </div>
  );
}

export default DroppableColumn;
