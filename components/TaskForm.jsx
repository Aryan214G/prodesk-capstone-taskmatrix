"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { createTask } from "@/lib/tasks";
import { createActivity } from "@/lib/activities";

export default function TaskForm({
    projectId,
    members = [],
    onCreated,
}) {
    const user = useSelector((state) => state.auth.user);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("backlog");
    const [loading, setLoading] = useState(false);
    const [assigneeId, setAssigneeId] = useState("");
    const [labels, setLabels] = useState([]);
    const [labelInput, setLabelInput] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (!title.trim() || !projectId || !user?.uid) {
            return;
        }

        setLoading(true);

        try {
            const task = await createTask({
                title: title.trim(),
                description: description.trim(),
                priority,
                dueDate,
                status,
                projectId,
                ownerId: user.uid,
                assigneeId: assigneeId || null,
                labels,
                subtasks: [],
            });

            await createActivity({
                userId: user.uid,
                userName: user.name || user.email,
                projectId,
                type: "task_created",
                message: `created task "${task.title}"`,
                taskId: task.id,
            });

            setTitle("");
            setDescription("");
            setPriority("medium");
            setDueDate("");
            setStatus("backlog");
            setAssigneeId("");
            setLabels([]);
            setLabelInput("");

            onCreated?.(task);
        } catch (error) {
            console.error("Failed to create task:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create task</h2>

            <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
            />

            <textarea
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
            />

            <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
            >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>

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
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
            >
                <option value="">Unassigned</option>

                {members.map((member) => (
                    <option key={member.uid} value={member.uid}>
                        {member.name || member.email}
                    </option>
                ))}
            </select>

            <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
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

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create task"}
            </button>
        </form>
    );
}