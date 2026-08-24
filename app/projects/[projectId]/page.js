"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import { db } from "@/lib/firebase";
import { getProjectTasks, updateTask, deleteTask } from "@/lib/tasks";
import TaskModal from "@/components/TaskModal";
import { createActivity } from "@/lib/activities";
import { useSelector } from "react-redux";
import {
    getProjectMembers,
} from "@/lib/projects";
import ColumnManager from "@/components/ColumnManager";
import MemberForm from "@/components/MemberForm";
import { toast } from "sonner";

const defaultColumns = [
    { id: "backlog", name: "Backlog", order: 0 },
    { id: "todo", name: "Todo", order: 1 },
    { id: "progress", name: "In Progress", order: 2 },
    { id: "review", name: "Review", order: 3 },
    { id: "done", name: "Done", order: 4 },
];



export default function ProjectPage() {
    const { projectId } = useParams();
    const user = useSelector((state) => state.auth.user);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [members, setMembers] = useState([]);
    const [columns, setColumns] = useState(defaultColumns);
    const [showColumnManager, setShowColumnManager] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [savingColumns, setSavingColumns] = useState(false);
    const [savingTask, setSavingTask] = useState(false);
    const [deletingTaskIds, setDeletingTaskIds] = useState([]);
    const [updatingTaskIds, setUpdatingTaskIds] = useState([]);



    useEffect(() => {
        if (!projectId || !user?.uid) return;

        let isActive = true;

        async function loadProject() {
            setLoading(true);
            setLoadError(false);

            try {
                const projectSnapshot = await getDoc(
                    doc(db, "projects", projectId)
                );

                if (!projectSnapshot.exists()) {
                    if (isActive) {
                        setProject(null);
                    }
                    return;
                }

                const projectData = {
                    id: projectSnapshot.id,
                    ...projectSnapshot.data(),
                };

                const isMember =
                    user?.uid === projectData.ownerId ||
                    (projectData.memberIds || []).includes(user?.uid);

                if (!isMember) {
                    if (isActive) {
                        setProject(null);
                    }
                    return;
                }

                const projectMembers = await getProjectMembers(
                    projectData.memberIds || []
                );

                const projectTasks = await getProjectTasks(projectId);

                if (isActive) {
                    setProject(projectData);
                    setColumns(projectData.columns || defaultColumns);
                    setMembers(projectMembers);
                    setTasks(projectTasks);
                }
            } catch (error) {
                console.error("Failed to load project:", error);

                if (isActive) {
                    setProject(null);
                    setLoadError(true);
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        }

        loadProject();

        return () => {
            isActive = false;
        };
    }, [projectId, user]);

    async function handleColumnsSave(updatedColumns) {
        if (savingColumns) return;

        setSavingColumns(true);

        try {
            await updateDoc(doc(db, "projects", projectId), {
                columns: updatedColumns,
            });

            setColumns(updatedColumns);
            setShowColumnManager(false);
        } catch (error) {
            console.error("Failed to save columns:", error);
            toast.error("Failed to save columns");
        } finally {
            setSavingColumns(false);
        }
    }

    if (loading) {
        return (
            <AuthGuard>
                <main className="page-message loading-state" role="status">
                    <span className="loading-spinner" aria-hidden="true" />
                    <p>Loading project...</p>
                </main>
            </AuthGuard>
        );
    }

    if (loadError) {
        return (
            <AuthGuard>
                <p className="page-message" role="alert">Unable to load project.</p>
            </AuthGuard>
        );
    }

    if (!project) {
        return (
            <AuthGuard>
                <p className="page-message">Project not found.</p>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <main className="app-shell project-page">
                <header className="page-header project-header">
                    <div>
                        <h1>{project.name}</h1>
                        {project.description && <p>{project.description}</p>}
                    </div>
                </header>

                <MemberForm projectId={projectId} />


                <TaskForm
                    projectId={projectId}
                    members={members}
                    onCreated={(task) => {
                        setTasks((current) => [task, ...current]);
                    }}
                />

                <section className="tasks-section">
                    <div className="section-heading">
                        <h2>Tasks</h2>
                    </div>

                    <button
                        className="button button-secondary manage-columns-button"
                        type="button"
                        onClick={() => setShowColumnManager(true)}
                        disabled={savingColumns}
                    >
                        Manage Columns
                    </button>

                    {showColumnManager && (
                        <ColumnManager
                            columns={columns}
                            tasks={tasks}
                            onSave={handleColumnsSave}
                            onClose={() => setShowColumnManager(false)}
                            isSaving={savingColumns}
                        />
                    )}


                    <TaskList
                        tasks={tasks}
                        columns={columns}
                        onEdit={(task) => setSelectedTask(task)}
                        deletingTaskIds={deletingTaskIds}
                        updatingTaskIds={updatingTaskIds}
                        onDelete={async (taskId) => {
                            if (
                                deletingTaskIds.includes(taskId) ||
                                updatingTaskIds.includes(taskId)
                            ) {
                                return;
                            }

                            const confirmed = window.confirm(
                                "Are you sure you want to delete this task?"
                            );

                            if (!confirmed) return;

                            const task = tasks.find((item) => item.id === taskId);

                            if (!task) return;

                            setDeletingTaskIds((current) => [
                                ...current,
                                taskId,
                            ]);

                            try {
                                await deleteTask(taskId);

                                await createActivity({
                                    userId: user.uid,
                                    userName: user.name || user.email,
                                    projectId,
                                    type: "task_deleted",
                                    message: `deleted task "${task.title}"`,
                                    taskId,
                                });

                                setTasks((current) =>
                                    current.filter((task) => task.id !== taskId)
                                );

                                toast.success("Task deleted");
                            } catch (error) {
                                console.error("Failed to delete task:", error);
                                toast.error("Failed to delete task");
                            } finally {
                                setDeletingTaskIds((current) =>
                                    current.filter((id) => id !== taskId)
                                );
                            }
                        }}

                        onStatusChange={async (taskId, newStatus) => {
                            if (
                                deletingTaskIds.includes(taskId) ||
                                updatingTaskIds.includes(taskId)
                            ) {
                                return;
                            }

                            const task = tasks.find((item) => item.id === taskId);

                            if (!task) return;

                            setUpdatingTaskIds((current) => [
                                ...current,
                                taskId,
                            ]);

                            try {
                                await updateTask(taskId, {
                                    status: newStatus,
                                });

                                const newColumn = columns.find(
                                    (column) => column.id === newStatus
                                );

                                await createActivity({
                                    userId: user.uid,
                                    userName: user.name || user.email,
                                    projectId,
                                    type: "task_status_changed",
                                    message: `moved "${task.title}" to ${newColumn?.name || newStatus}`,
                                    taskId,
                                });

                                setTasks((current) =>
                                    current.map((task) =>
                                        task.id === taskId
                                            ? { ...task, status: newStatus }
                                            : task
                                    )
                                );

                                toast.success(
                                    `Task moved to ${newColumn?.name || newStatus}`
                                );
                            } catch (error) {
                                console.error("Failed to update task status:", error);
                            } finally {
                                setUpdatingTaskIds((current) =>
                                    current.filter((id) => id !== taskId)
                                );
                            }
                        }}
                    />
                </section>
                <TaskModal
                    task={selectedTask}
                    isSaving={savingTask}
                    onClose={() => {
                        if (!savingTask) {
                            setSelectedTask(null);
                        }
                    }}
                    onSave={async (updates) => {
                        if (!selectedTask || savingTask) return;

                        setSavingTask(true);

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

                            toast.success("Task updated");
                            setSelectedTask(null);
                        } catch (error) {
                            console.error("Failed to update task:", error);
                            toast.error("Failed to update task");
                        } finally {
                            setSavingTask(false);
                        }
                    }}
                />
            </main>
        </AuthGuard>
    );
}
