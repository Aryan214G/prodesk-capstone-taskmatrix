"use client";

const columns = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Todo" },
  { id: "progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export default function TaskList({ tasks, onEdit, onDelete }) {
  return (
    <div className="kanban-board">
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.id
        );

        return (
          <section key={column.id} className="kanban-column">
            <h2>{column.title}</h2>

            <div className="kanban-tasks">
              {columnTasks.map((task) => (
                <article key={task.id} className="task-card">
                  <h3>{task.title}</h3>

                  {task.description && <p>{task.description}</p>}

                  <span>{task.priority}</span>

                  {task.dueDate && <p>Due: {task.dueDate}</p>}

                  <div>
                    <button onClick={() => onEdit(task)}>
                      Edit
                    </button>

                    <button onClick={() => onDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}