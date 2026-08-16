import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function createProject(userId, name, description = "") {
  const project = {
    name,
    description,
    ownerId: userId,
    memberIds: [userId],
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "projects"), project);

  return {
    id: docRef.id,
    ...project,
  };
}

export async function getUserProjects(userId) {
  const projectsQuery = query(
    collection(db, "projects"),
    where("memberIds", "array-contains", userId)
  );

  const snapshot = await getDocs(projectsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}