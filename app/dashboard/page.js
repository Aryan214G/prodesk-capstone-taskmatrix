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

export default function DashboardPage() {
  const router = useRouter();

  const user = useSelector((state) => state.auth.user);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }


  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    async function loadProjects() {
      const data = await getUserProjects(user.uid);
      setProjects(data);
    }

    loadProjects();
  }, [user]);

  return (
    <AuthGuard>
      <main>
        <h1>TaskMatrix Dashboard</h1>
        <p>Welcome to your project workspace.</p>

        <button onClick={handleLogout}>
          Logout
        </button>

        <ProjectForm
          onCreated={(project) => {
            setProjects((current) => [project, ...current]);
          }}
        />

        {projects.map((project) => (
          <div key={project.id}>
            <h3>{project.name}</h3>

            <p>{project.description}</p>

            <Link href={`/projects/${project.id}`}>
              Open project
            </Link>
          </div>
        ))}
      </main>
    </AuthGuard>
  );
}