"use client";

import { useEffect, useState } from "react";
import SubtaskList from "@/components/SubtaskList";

export default function TaskModal({ task, onClose, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("backlog");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [subtasks, setSubtasks] = useState([]);
    const [labels, setLabels] = useState([]);
    const [labelInput, setLabelInput] = useState("");

    useEffect(() => {
        if (!task) return;

        setTitle(task.title || "");
        setDescription(task.description || "");
        setStatus(task.status || "backlog");
        setPriority(task.priority || "medium");
        setDueDate(task.dueDate || "");
        setSubtasks(task.subtasks || []);
        setLabels(task.labels || []);
    }, [task]);

    if (!task) return null;

    function handleSubmit(event) {
        event.preventDefault();

        onSave({
            title: title.trim(),
            description: description.trim(),
            status,
            priority,
            dueDate,
            subtasks,
            labels,
        });
    }

    return (
        <div>
            <div>
                <h2>Edit Task</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Task title"
                        required
                    />

                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Description"
                    />

                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        <option value="backlog">Backlog</option>
                        <option value="todo">Todo</option>
                        <option value="progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                    </select>

                    <select
                        value={priority}
                        onChange={(event) => setPriority(event.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>

                    <input
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                    />

                    <SubtaskList
                        subtasks={subtasks}
                        onChange={setSubtasks}
                    />

                    <div>
                        <h3>Labels</h3>

                        <div>
                            {labels.map((label) => (
                                <span key={label}>
                                    {label}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setLabels((current) =>
                                                current.filter((item) => item !== label)
                                            )
                                        }
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>

                        <input
                            value={labelInput}
                            onChange={(event) => setLabelInput(event.target.value)}
                            placeholder="Add label"
                        />

                        <button
                            type="button"
                            onClick={() => {
                                const label = labelInput.trim();

                                if (!label || labels.includes(label)) {
                                    return;
                                }

                                setLabels((current) => [...current, label]);
                                setLabelInput("");
                            }}
                        >
                            Add label
                        </button>
                    </div>

                    <button type="submit">
                        Save changes
                    </button>

                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}