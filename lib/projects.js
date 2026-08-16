import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
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

export async function addProjectMember(projectId, email) {
  const usersQuery = query(
    collection(db, "users"),
    where("email", "==", email.trim().toLowerCase())
  );

  const snapshot = await getDocs(usersQuery);

  if (snapshot.empty) {
    throw new Error("User not found.");
  }

  const userDoc = snapshot.docs[0];
  const userId = userDoc.id;

  const projectRef = doc(db, "projects", projectId);
  const projectSnapshot = await getDoc(projectRef);

  if (!projectSnapshot.exists()) {
    throw new Error("Project not found.");
  }

  const project = projectSnapshot.data();
  const memberIds = project.memberIds || [];

  if (memberIds.includes(userId)) {
    throw new Error("User is already a member.");
  }

  await updateDoc(projectRef, {
    memberIds: [...memberIds, userId],
  });

  return userId;
}

export async function getProjectMembers(memberIds = []) {
  const members = await Promise.all(
    memberIds.map(async (userId) => {
      const userSnapshot = await getDoc(
        doc(db, "users", userId)
      );

      if (!userSnapshot.exists()) {
        return null;
      }

      return {
        uid: userSnapshot.id,
        ...userSnapshot.data(),
      };
    })
  );

  return members.filter(Boolean);
}