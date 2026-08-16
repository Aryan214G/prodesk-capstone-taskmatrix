"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { addProjectMember } from "@/lib/projects";

export default function MemberForm({ projectId }) {
  const user = useSelector((state) => state.auth.user);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.uid || !email.trim()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await addProjectMember(projectId, email);

      setEmail("");
      setMessage("Member added successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add member</h3>

      <input
        type="email"
        placeholder="Member email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add member"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}