"use client";

import { useState } from "react";

export default function ColumnManager({
  columns,
  onSave,
  onClose,
}) {
  const [localColumns, setLocalColumns] = useState(
    [...columns].sort((a, b) => a.order - b.order)
  );

  const [newColumnName, setNewColumnName] = useState("");

  function addColumn() {
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
    setLocalColumns((current) =>
      current.map((column) =>
        column.id === id
          ? { ...column, name }
          : column
      )
    );
  }

  function removeColumn(id) {
    if (localColumns.length <= 1) return;

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
    onSave(localColumns);
  }

  return (
    <div>
      <h2>Manage Columns</h2>

      {localColumns.map((column, index) => (
        <div key={column.id}>
          <button
            type="button"
            onClick={() => moveColumn(index, -1)}
            disabled={index === 0}
          >
            ↑
          </button>

          <button
            type="button"
            onClick={() => moveColumn(index, 1)}
            disabled={index === localColumns.length - 1}
          >
            ↓
          </button>

          <input
            value={column.name}
            onChange={(event) =>
              renameColumn(column.id, event.target.value)
            }
          />

          <button
            type="button"
            onClick={() => removeColumn(column.id)}
          >
            Delete
          </button>
        </div>
      ))}

      <div>
        <input
          value={newColumnName}
          onChange={(event) =>
            setNewColumnName(event.target.value)
          }
          placeholder="New column name"
        />

        <button type="button" onClick={addColumn}>
          Add Column
        </button>
      </div>

      <button type="button" onClick={handleSave}>
        Save
      </button>

      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}