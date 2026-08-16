"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import { db } from "@/lib/firebase";
import { getProjectTasks, updateTask, deleteTask } from "@/lib/tasks";
import TaskModal from "@/components/TaskModal";
import { createActivity } from "@/lib/activities";
import { useSelector } from "react-redux";


export default function ProjectPage() {
    const { projectId } = useParams();
    const user = useSelector((state) => state.auth.user);   

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

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
                    onEdit={(task) => setSelectedTask(task)}
                    onDelete={async (taskId) => {
                        const confirmed = window.confirm(
                            "Are you sure you want to delete this task?"
                        );

                        if (!confirmed) return;

                        try {
                            await deleteTask(taskId);

                            setTasks((current) =>
                                current.filter((task) => task.id !== taskId)
                            );
                        } catch (error) {
                            console.error("Failed to delete task:", error);
                        }
                    }}
                    onStatusChange={async (taskId, newStatus) => {
                        try {
                            await updateTask(taskId, {
                                status: newStatus,
                            });

                            setTasks((current) =>
                                current.map((task) =>
                                    task.id === taskId
                                        ? { ...task, status: newStatus }
                                        : task
                                )
                            );
                        } catch (error) {
                            console.error("Failed to update task status:", error);
                        }
                    }}
                />
                <TaskModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={async (updates) => {
                        try {
                            await updateTask(selectedTask.id, updates);

                            await createActivity({
                                userId: user.uid,
                                userName: user.name || user.email,
                                projectId,
                                type: "task_updated",
                                message: `updated task "${selectedTask.title}"`,
                                taskId: selectedTask.id,
                            });

                            setTasks((current) =>
                                current.map((task) =>
                                    task.id === selectedTask.id
                                        ? { ...task, ...updates }
                                        : task
                                )
                            );

                            setSelectedTask(null);
                        } catch (error) {
                            console.error("Failed to update task:", error);
                        }
                    }}
                />
            </main>
        </AuthGuard>
    );
}