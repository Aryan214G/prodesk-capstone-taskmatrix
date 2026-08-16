"use client";

export default function TaskList({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return <p>No tasks yet.</p>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>

          {task.description && <p>{task.description}</p>}

          <p>
            {task.status} · {task.priority}
          </p>

          {task.dueDate && <p>Due: {task.dueDate}</p>}

          <button onClick={() => onEdit(task)}>
            Edit
          </button>

          <button onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}