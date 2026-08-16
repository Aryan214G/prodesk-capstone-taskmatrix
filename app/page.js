import Link from "next/link";

export default function Home() {
  return (
    <main className="auth-page">
      <section className="auth-card home-card">
        <h1>TaskMatrix</h1>
        <p>Agile project management for focused software teams.</p>
        <Link className="button landing-login" href="/login">
          Login
        </Link>
      </section>
    </main>
  );
}
