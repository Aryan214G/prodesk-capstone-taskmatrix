"use client";

import { useState } from "react";

export default function SubtaskList({ subtasks = [], onChange }) {
    const [title, setTitle] = useState("");

    function addSubtask() {
        if (!title.trim()) return;

        const newSubtask = {
            id: crypto.randomUUID(),
            title: title.trim(),
            completed: false,
        };

        onChange([...subtasks, newSubtask]);
        setTitle("");
    }

    function toggleSubtask(id) {
        onChange(
            subtasks.map((subtask) =>
                subtask.id === id
                    ? {
                        ...subtask,
                        completed: !subtask.completed,
                    }
                    : subtask
            )
        );
    }

    function deleteSubtask(id) {
        onChange(subtasks.filter((subtask) => subtask.id !== id));
    }

    return (
        <div>
            <h3>Subtasks</h3>

            {subtasks.map((subtask) => (
                <div key={subtask.id}>
                    <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(subtask.id)}
                    />

                    <span>{subtask.title}</span>

                    <button
                        type="button"
                        onClick={() => deleteSubtask(subtask.id)}
                    >
                        Delete
                    </button>
                </div>
            ))}

            <div>
                <input
                    type="text"
                    placeholder="Add subtask"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />

                <button type="button" onClick={addSubtask}>
                    Add
                </button>
            </div>
        </div>
    );
}