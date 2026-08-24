"use client";

import { useEffect, useState } from "react";
import SubtaskList from "@/components/SubtaskList";

export default function TaskModal({ task, onClose, onSave, isSaving = false, members = [] }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("backlog");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
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
        setAssigneeId(task.assigneeId || "");
        setSubtasks(task.subtasks || []);
        setLabels(task.labels || []);
    }, [task]);

    if (!task) return null;

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSaving) return;

        await onSave({
            title: title.trim(),
            description: description.trim(),
            status,
            priority,
            dueDate,
            assigneeId: assigneeId || null,
            subtasks,
            labels,
        });
    }

    return (
        <div className="modal-backdrop" role="presentation">
            <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
                <h2 id="task-modal-title">Edit Task</h2>

                <form className="modal-form" onSubmit={handleSubmit} aria-busy={isSaving}>
                    <fieldset className="modal-form-fields" disabled={isSaving}>
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

                    <SubtaskList
                        subtasks={subtasks}
                        onChange={setSubtasks}
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
                    </fieldset>

                    <div className="modal-actions">
                        <button className="button" type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save changes"}
                        </button>

                        <button
                            className="button button-secondary"
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
