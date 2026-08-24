"use client";

import TaskForm from "@/components/TaskForm";

export default function CreateTaskModal({ open, projectId, members, onClose, onCreated }) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" role="presentation" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="create-task-modal-title">
                <TaskForm
                    projectId={projectId}
                    members={members}
                    onCreated={onCreated}
                />

                <div className="modal-actions">
                    <button
                        className="button button-secondary"
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
