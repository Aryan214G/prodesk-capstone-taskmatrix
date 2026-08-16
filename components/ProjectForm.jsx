"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { createProject } from "@/lib/projects";

export default function ProjectForm({ onCreated }) {
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !user?.uid) {
      return;
    }

    setLoading(true);

    try {
      const columns = [
        { id: "backlog", name: "Backlog", order: 0 },
        { id: "todo", name: "Todo", order: 1 },
        { id: "progress", name: "In Progress", order: 2 },
        { id: "review", name: "Review", order: 3 },
        { id: "done", name: "Done", order: 4 },
      ];

      const project = await createProject(
        user.uid,
        name.trim(),
        description.trim(),
        columns
      );

      setName("");
      setDescription("");

      onCreated?.(project);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel project-form" onSubmit={handleSubmit}>
      <h2>Create project</h2>

      <input
        type="text"
        placeholder="Project name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <button className="button" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
