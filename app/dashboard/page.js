"use client";

import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { auth } from "@/lib/firebase";
import { useSelector } from "react-redux";
import { getUserProjects } from "@/lib/projects";
import ProjectForm from "@/components/ProjectForm";
import MemberForm from "@/components/MemberForm";
import Link from "next/link";
import { subscribeToProjectActivity } from "@/lib/activities";

export default function DashboardPage() {
  const router = useRouter();

  const user = useSelector((state) => state.auth.user);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }


  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    async function loadProjects() {
      const data = await getUserProjects(user.uid);
      setProjects(data);
    }

    loadProjects();
  }, [user]);

  useEffect(() => {
    if (!projects.length) {
      setActivities([]);
      return;
    }

    const unsubscribes = projects.map((project) =>
      subscribeToProjectActivity(project.id, (projectActivities) => {
        setActivities((current) => {
          const otherActivities = current.filter(
            (activity) => activity.projectId !== project.id
          );

          return [...otherActivities, ...projectActivities].sort(
            (a, b) => {
              const aTime = a.createdAt?.toMillis?.() || 0;
              const bTime = b.createdAt?.toMillis?.() || 0;

              return bTime - aTime;
            }
          );
        });
      })
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [projects]);


  return (
    <AuthGuard>
      <main className="app-shell dashboard-page">
        <header className="page-header dashboard-header">
          <div>
            <h1>TaskMatrix Dashboard</h1>
            <p>Welcome to your project workspace.</p>
          </div>

          <button className="button button-secondary" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="dashboard-grid">
          <ProjectForm
            onCreated={(project) => {
              setProjects((current) => [project, ...current]);
            }}
          />

          <section className="panel activity-feed">
            <div className="section-heading">
              <h2>Recent Activity</h2>
            </div>

            {activities.length === 0 ? (
              <p className="empty-state">No recent activity.</p>
            ) : (
              <div className="activity-list">
                {activities.slice(0, 10).map((activity) => (
                  <div className="activity-item" key={activity.id}>
                    <p>
                      <strong>{activity.userName}</strong> {activity.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="projects-section">
          <div className="section-heading">
            <h2>Projects</h2>
          </div>

          {projects.length === 0 ? (
            <p className="empty-state panel">Create your first project to start organizing work.</p>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <Link className="text-link" href={`/projects/${project.id}`}>
                    Open project
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}
