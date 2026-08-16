"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import { db } from "@/lib/firebase";
import { getProjectTasks } from "@/lib/tasks";

export default function ProjectPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      try {
        const projectSnapshot = await getDoc(
          doc(db, "projects", projectId)
        );

        if (!projectSnapshot.exists()) {
          setProject(null);
          return;
        }

        setProject({
          id: projectSnapshot.id,
          ...projectSnapshot.data(),
        });

        const projectTasks = await getProjectTasks(projectId);
        setTasks(projectTasks);
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <AuthGuard>
      <main>
        <h1>{project.name}</h1>

        {project.description && <p>{project.description}</p>}

        <TaskForm
          projectId={projectId}
          onCreated={(task) => {
            setTasks((current) => [task, ...current]);
          }}
        />

        <h2>Tasks</h2>

        <TaskList
          tasks={tasks}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </main>
    </AuthGuard>
  );
}