"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, Save, X } from "lucide-react";

export default function ColumnManager({
    columns,
    tasks,
    onSave,
    onClose,
    isSaving = false,
}) {
    const [localColumns, setLocalColumns] = useState(
        [...columns].sort((a, b) => a.order - b.order)
    );

    const [newColumnName, setNewColumnName] = useState("");

    function addColumn() {
        if (isSaving) return;

        const name = newColumnName.trim();

        if (!name) return;

        const column = {
            id: crypto.randomUUID(),
            name,
            order: localColumns.length,
        };

        setLocalColumns((current) => [...current, column]);
        setNewColumnName("");
    }

    function renameColumn(id, name) {
        if (isSaving) return;

        setLocalColumns((current) =>
            current.map((column) =>
                column.id === id
                    ? { ...column, name }
                    : column
            )
        );
    }

    function removeColumn(id) {
        if (isSaving) return;

        if (localColumns.length <= 1) return;

        const hasTasks = tasks.some(
            (task) => task.status === id
        );

        if (hasTasks) {
            window.alert(
                "Cannot delete this column because it contains tasks. Move the tasks to another column first."
            );
            return;
        }

        setLocalColumns((current) =>
            current
                .filter((column) => column.id !== id)
                .map((column, index) => ({
                    ...column,
                    order: index,
                }))
        );
    }

    function moveColumn(index, direction) {
        if (isSaving) return;

        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= localColumns.length) {
            return;
        }

        const updated = [...localColumns];

        [updated[index], updated[newIndex]] = [
            updated[newIndex],
            updated[index],
        ];

        setLocalColumns(
            updated.map((column, index) => ({
                ...column,
                order: index,
            }))
        );
    }

    function handleSave() {
        if (isSaving) return;

        onSave(localColumns);
    }

    return (
        <div className="modal-backdrop" role="presentation">
            <div
                className="modal-dialog column-manager"
                role="dialog"
                aria-modal="true"
                aria-labelledby="column-manager-title"
            >
                <h2 id="column-manager-title">Manage Columns</h2>

                <div className="column-list">
                    {localColumns.map((column, index) => (
                        <div className="column-row" key={column.id}>
                            <div className="column-move-buttons">
                                <button
                                    className="button button-compact button-secondary"
                                    type="button"
                                    aria-label={`Move ${column.name} up`}
                                    onClick={() => moveColumn(index, -1)}
                                    disabled={isSaving || index === 0}
                                >
                                    <ChevronUp size={14} />
                                </button>

                                <button
                                    className="button button-compact button-secondary"
                                    type="button"
                                    aria-label={`Move ${column.name} down`}
                                    onClick={() => moveColumn(index, 1)}
                                    disabled={
                                        isSaving ||
                                        index === localColumns.length - 1
                                    }
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>

                            <input
                                aria-label="Column name"
                                value={column.name}
                                onChange={(event) =>
                                    renameColumn(column.id, event.target.value)
                                }
                                disabled={isSaving}
                            />

                            <button
                                className="button button-compact button-danger"
                                type="button"
                                onClick={() => removeColumn(column.id)}
                                disabled={isSaving}
                            >
                                <Trash2 size={13} /> Delete
                            </button>
                        </div>
                    ))}
                </div>

                <div className="column-add-form inline-form">
                    <input
                        value={newColumnName}
                        onChange={(event) =>
                            setNewColumnName(event.target.value)
                        }
                        placeholder="New column name"
                        disabled={isSaving}
                    />

                    <button
                        className="button button-secondary"
                        type="button"
                        onClick={addColumn}
                        disabled={isSaving}
                    >
                        <Plus size={14} /> Add Column
                    </button>
                </div>

                <div className="modal-actions">
                    <button
                        className="button"
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : <><Save size={16} /> Save</>}
                    </button>

                    <button
                        className="button button-secondary"
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        <X size={16} /> Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
