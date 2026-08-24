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



    useEffect(() => {
        if (!projectId || !user?.uid) return;

        async function loadProject() {
            try {

                const projectSnapshot = await getDoc(
                    doc(db, "projects", projectId)
                );

                if (!projectSnapshot.exists()) {
                    setProject(null);
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
                    setProject(null);
                    return;
                }

                setProject(projectData);
                setColumns(projectData.columns || defaultColumns);

                const projectMembers = await getProjectMembers(
                    projectData.memberIds || []
                );

                setMembers(projectMembers);

                const projectTasks = await getProjectTasks(projectId);
                setTasks(projectTasks);
            } catch (error) {
                console.error("Failed to load project:", error);
            } finally {
                setLoading(false);
            }
        }

        loadProject();
    }, [projectId, user]);

    async function handleColumnsSave(updatedColumns) {
        await updateDoc(doc(db, "projects", projectId), {
            columns: updatedColumns,
        });

        setColumns(updatedColumns);
        setShowColumnManager(false);
    }

    if (loading) {
        return <p className="page-message">Loading project...</p>;
    }

    if (!project) {
        return <p className="page-message">Project not found.</p>;
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
                    >
                        Manage Columns
                    </button>

                    {showColumnManager && (
                        <ColumnManager
                            columns={columns}
                            tasks={tasks}
                            onSave={handleColumnsSave}
                            onClose={() => setShowColumnManager(false)}
                        />
                    )}


                    <TaskList
                        tasks={tasks}
                        columns={columns}
                        onEdit={(task) => setSelectedTask(task)}
                        onDelete={async (taskId) => {
                            const confirmed = window.confirm(
                                "Are you sure you want to delete this task?"
                            );

                            if (!confirmed) return;

                            const task = tasks.find((item) => item.id === taskId);

                            if (!task) return;

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
                            }
                        }}

                        onStatusChange={async (taskId, newStatus) => {
                            const task = tasks.find((item) => item.id === taskId);

                            if (!task) return;

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
                            }
                        }}
                    />
                </section>
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

                            toast.success("Task updated");
                            setSelectedTask(null);
                        } catch (error) {
                            console.error("Failed to update task:", error);
                            toast.error("Failed to update task");
                        }
                    }}
                />
            </main>
        </AuthGuard>
    );
}
