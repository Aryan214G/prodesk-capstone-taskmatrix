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
  userName,
  projectId,
  type,
  message,
  taskId = null,
}) {
  await addDoc(collection(db, "activities"), {
    userId,
    userName,
    projectId,
    type,
    message,
    taskId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToProjectActivity(projectId, callback, onError) {
  const activitiesQuery = query(
    collection(db, "activities"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    activitiesQuery,
    (snapshot) => {
      const activities = snapshot.docs.map((activityDoc) => ({
        id: activityDoc.id,
        ...activityDoc.data(),
      }));

      callback(activities);
    },
    onError
  );
}
