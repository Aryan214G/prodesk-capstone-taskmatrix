"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <AuthGuard>
      <main>
        <h1>TaskMatrix Dashboard</h1>
        <p>Welcome to your project workspace.</p>

        <button onClick={handleLogout}>
          Logout
        </button>
      </main>
    </AuthGuard>
  );
}