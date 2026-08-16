import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function createActivity({
  userId,
  projectId,
  type,
  message,
  taskId = null,
}) {
  await addDoc(collection(db, "activities"), {
    userId,
    projectId,
    type,
    message,
    taskId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToProjectActivity(projectId, callback) {
  const activitiesQuery = query(
    collection(db, "activities"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(activitiesQuery, (snapshot) => {
    const activities = snapshot.docs.map((activityDoc) => ({
      id: activityDoc.id,
      ...activityDoc.data(),
    }));

    callback(activities);
  });
}