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
        <div className="subtask-list">
            <h3>Subtasks</h3>

            {subtasks.map((subtask) => (
                <div className="subtask-item" key={subtask.id}>
                    <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(subtask.id)}
                    />

                    <span className={subtask.completed ? "is-complete" : ""}>{subtask.title}</span>

                    <button
                        className="text-button danger-text"
                        type="button"
                        onClick={() => deleteSubtask(subtask.id)}
                    >
                        Delete
                    </button>
                </div>
            ))}

            <div className="inline-form">
                <input
                    type="text"
                    placeholder="Add subtask"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />

                <button className="button button-secondary" type="button" onClick={addSubtask}>
                    Add
                </button>
            </div>
        </div>
    );
}
