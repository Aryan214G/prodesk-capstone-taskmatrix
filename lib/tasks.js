import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function createTask(task) {
  const taskData = {
    ...task,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "tasks"), taskData);

  return {
    id: docRef.id,
    ...taskData,
  };
}

export async function getProjectTasks(projectId) {
  const tasksQuery = query(
    collection(db, "tasks"),
    where("projectId", "==", projectId)
  );

  const snapshot = await getDocs(tasksQuery);

  return snapshot.docs.map((taskDoc) => ({
    id: taskDoc.id,
    ...taskDoc.data(),
  }));
}

export async function updateTask(taskId, updates) {
  await updateDoc(doc(db, "tasks", taskId), updates);
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, "tasks", taskId));
}