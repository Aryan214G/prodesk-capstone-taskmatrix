"use client";

import Link from "next/link";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
    doc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name,
            });

            await setDoc(doc(db, "users", userCredential.user.uid), {
                name,
                email,
                role: "member",
                createdAt: serverTimestamp(),
            });

            console.log("Registered user:", userCredential.user);

            window.location.href = "/dashboard";
        }
        catch (error) {
            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                setError("An account with this email already exists.");
            }
            else if (error.code === "auth/weak-password") {
                setError("Password must be at least 6 characters.");
            }
            else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            }
            else {
                setError("Registration failed. Please try again.");
            }
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Create your TaskMatrix account</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            {error && <p>{error}</p>}

            <p>
                Already have an account? <Link href="/login">Login</Link>
            </p>
        </main>
    );
}