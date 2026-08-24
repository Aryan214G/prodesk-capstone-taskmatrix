"use client";

import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { auth } from "@/lib/firebase";
import { useSelector } from "react-redux";
import { getUserProjects } from "@/lib/projects";
import ProjectForm from "@/components/ProjectForm";
import Link from "next/link";
import { subscribeToProjectActivity } from "@/lib/activities";
import { LogOut, Menu, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const user = useSelector((state) => state.auth.user);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }


  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [activitiesError, setActivitiesError] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    let isActive = true;

    async function loadProjects() {
      setProjectsLoading(true);
      setActivitiesLoading(true);
      setProjectsError(false);
      setActivitiesError(false);

      try {
        const data = await getUserProjects(user.uid);

        if (isActive) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);

        if (isActive) {
          setProjects([]);
          setProjectsError(true);
        }
      } finally {
        if (isActive) {
          setProjectsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    if (projectsLoading) return;

    if (!projects.length) {
      setActivities([]);
      setActivitiesLoading(false);
      setActivitiesError(projectsError);
      return;
    }

    let isActive = true;
    const pendingProjectIds = new Set(projects.map((project) => project.id));

    setActivitiesLoading(true);
    setActivitiesError(false);

    function markProjectActivityLoaded(projectId) {
      pendingProjectIds.delete(projectId);

      if (pendingProjectIds.size === 0 && isActive) {
        setActivitiesLoading(false);
      }
    }

    const unsubscribes = projects.map((project) =>
      subscribeToProjectActivity(
        project.id,
        (projectActivities) => {
          if (!isActive) return;

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

          markProjectActivityLoaded(project.id);
        },
        (error) => {
          console.error("Failed to load recent activity:", error);

          if (isActive) {
            setActivitiesError(true);
            markProjectActivityLoaded(project.id);
          }
        }
      )
    );

    return () => {
      isActive = false;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [projects, projectsError, projectsLoading]);


  return (
    <AuthGuard>
      <main className="app-shell dashboard-page">
        <header className="page-header dashboard-header">
          <div className="dashboard-title">
            <h1>TaskMatrix Dashboard</h1>
            <p>Welcome to your project workspace.</p>
          </div>

          <button
            className="menu-toggle button button-secondary"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Menu size={20} />
          </button>

          <nav className={`dashboard-menu ${menuOpen ? "is-open" : ""}`}>
            <button
              className="button button-secondary"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </header>

        <div className="dashboard-grid">
          <ProjectForm
            disabled={projectsLoading}
            onCreated={(project) => {
              setProjects((current) => [project, ...current]);
            }}
          />

          <section className="panel activity-feed">
            <div className="section-heading">
              <h2>Recent Activity</h2>
            </div>

            {activitiesLoading ? (
              <div className="loading-state loading-panel" role="status">
                <span className="loading-spinner" aria-hidden="true" />
                <p>Loading recent activity...</p>
              </div>
            ) : activitiesError ? (
              <p className="empty-state" role="alert">
                Unable to load recent activity.
              </p>
            ) : activities.length === 0 ? (
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

          {projectsLoading ? (
            <div className="panel loading-state loading-panel" role="status">
              <span className="loading-spinner" aria-hidden="true" />
              <p>Loading projects...</p>
            </div>
          ) : projectsError ? (
            <p className="empty-state panel" role="alert">
              Unable to load projects. Please refresh the page.
            </p>
          ) : projects.length === 0 ? (
            <p className="empty-state panel">Create your first project to start organizing work.</p>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <Link className="text-link" href={`/projects/${project.id}`}>
                    Open project <ArrowRight size={14} />
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
