"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const columns = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Todo" },
  { id: "progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

function TaskCard({ task, onEdit, onDelete, dragging = false }) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: task.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="task-card"
    >
      <h3>{task.title}</h3>

      {task.description && <p>{task.description}</p>}

      <p>{task.priority}</p>

      {task.dueDate && <p>Due: {task.dueDate}</p>}

      {!dragging && (
        <div>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onEdit(task)}
          >
            Edit
          </button>

          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

function KanbanColumn({ column, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <section
      ref={setNodeRef}
      className="kanban-column"
      style={{
        minHeight: "300px",
        opacity: isOver ? 0.7 : 1,
      }}
    >
      <h2>{column.title}</h2>

      <div className="kanban-tasks">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

export default function TaskList({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={(event) => {
        const { active, over } = event;

        if (!over) return;

        const task = tasks.find((item) => item.id === active.id);

        if (!task) return;

        const newStatus = columns.some(
          (column) => column.id === over.id
        )
          ? over.id
          : task.status;

        if (newStatus !== task.status) {
          onStatusChange(task.id, newStatus);
        }
      }}
    >
      <div className="kanban-board">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(
              (task) => task.status === column.id
            )}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay />
    </DndContext>
  );
}