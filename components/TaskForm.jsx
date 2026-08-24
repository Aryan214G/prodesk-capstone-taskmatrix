"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { createTask } from "@/lib/tasks";
import { createActivity } from "@/lib/activities";
import SubtaskList from "@/components/SubtaskList";
import { toast } from "sonner";

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
    const [subtasks, setSubtasks] = useState([]);
    const [generatingSubtasks, setGeneratingSubtasks] = useState(false);
    const [aiError, setAiError] = useState("");


    async function handleGenerateSubtasks() {
        if (loading || generatingSubtasks) {
            return;
        }

        if (!title.trim()) {
            setAiError("Enter a task title first.");
            return;
        }

        setGeneratingSubtasks(true);
        setAiError("");

        try {
            const response = await fetch("/api/ai/subtasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate subtasks.");
            }

            const generatedSubtasks = data.subtasks.map((text) => ({
                id: crypto.randomUUID(),
                title: text,
                completed: false,
            }));

            setSubtasks(generatedSubtasks);
            toast.success("Subtasks generated");

        } catch (error) {
            console.error("Failed to generate subtasks:", error);
            toast.error(error.message || "Failed to generate subtasks");
            setAiError(error.message);
        } finally {
            setGeneratingSubtasks(false);
        }
    }


    async function handleSubmit(event) {
        event.preventDefault();

        if (
            loading ||
            generatingSubtasks ||
            !title.trim() ||
            !projectId ||
            !user?.uid
        ) {
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
                subtasks,
            });

            await createActivity({
                userId: user.uid,
                userName: user.name || user.email,
                projectId,
                type: "task_created",
                message: `created task "${task.title}"`,
                taskId: task.id,
            });

            toast.success("Task created successfully");

            setTitle("");
            setDescription("");
            setPriority("medium");
            setDueDate("");
            setStatus("backlog");
            setAssigneeId("");
            setLabels([]);
            setLabelInput("");
            setSubtasks([]);
            setAiError("");

            onCreated?.(task);
        } catch (error) {
            console.error("Failed to create task:", error);
            toast.error("Failed to create task");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="panel task-form" onSubmit={handleSubmit}>
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

            <div className="label-editor">
                <h3>Labels</h3>

                <div className="label-list">
                    {labels.map((label) => (
                        <span className="label-chip" key={label}>
                            {label}

                            <button
                                className="chip-remove"
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

                <div className="inline-form">
                    <input
                        value={labelInput}
                        onChange={(event) => setLabelInput(event.target.value)}
                        placeholder="Add label"
                    />

                    <button
                        className="button button-secondary"
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
            </div>

            <div className="subtask-editor">
                <div className="subtask-header">
                    <h3>Subtasks</h3>

                    <button
                        className="button button-secondary"
                        type="button"
                        onClick={handleGenerateSubtasks}
                        disabled={generatingSubtasks || loading}
                    >
                        {generatingSubtasks
                            ? "Generating..."
                            : "Generate with AI"}
                    </button>
                </div>

                {aiError && (
                    <p className="form-error">{aiError}</p>
                )}

                <SubtaskList
                    subtasks={subtasks}
                    onChange={setSubtasks}
                />
            </div>

            <button
                className="button task-submit"
                type="submit"
                disabled={loading || generatingSubtasks}
            >
                {loading ? "Creating..." : "Create task"}
            </button>
        </form>
    );
}
