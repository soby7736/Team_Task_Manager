
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function DraggableTask({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded-lg p-4 shadow mb-3 cursor-grab"
    >
      <h3 className="font-bold text-gray-800">
        {task.title}
      </h3>

      <p className="text-gray-600 text-sm mt-2">
        {task.description}
      </p>
    </div>
  );
}

export default DraggableTask;
