
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Link, useParams } from "react-router-dom";

function DraggableTask({ task }) {
  const { id } = useParams();

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg p-4 shadow mb-3"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800">
          {task.title}
        </h3>

        {/* Drag handle */}
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-gray-500 px-2"
          aria-label={`Drag ${task.title}`}
        >
          ⠿
        </button>
      </div>

      <p className="text-gray-600 text-sm mt-2">
        {task.description}
      </p>

      {/* Task Details link */}
      <Link
        to={`/projects/${id}/tasks/${task.id}`}
        className="inline-block mt-3 text-blue-600 hover:underline text-sm"
      >
        View Details
      </Link>
    </div>
  );
}

export default DraggableTask;
