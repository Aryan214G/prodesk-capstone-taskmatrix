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
      const project = await createProject(
        user.uid,
        name.trim(),
        description.trim()
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
