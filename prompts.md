1) What are the features to include in a jira clone?

2) What is firebase and supabase?

3) Cleanup the readme to look good on github. Add badges at the top

4) Create a starter figma ui for a project management web app with login, dashboard and kanban board. keep it as a base template since I'll customize it later

## Sprint 14

1) Help me set up firebase for my web application

2) Help me resolve this error

## Sprint 15

1) Help me plan a firestore schema for TaskMatrix based on my project, task, member, activity and Kanban requirements mentioned in the README.

2) show me how to save a Firebase users profile with a role after registration

3) Help me create and read user owned projects from Firestore in my TaskMatrix dashboard.

4) Help me add simple member assignment to TaskMatrix projects using firebase user Ids.

5) I am getting a "Missing or insufficient permissions" error when adding a project member in my TaskMatrix app. I'm using Firebase Firestore, and my code queries the users collection by email to get another user's UID.

6) show me how to create and read tasks for a specific project from Firestore

7) My figma has five Kanban statuses, help me map my Firestore task status into those columns   

8) I need to add a status selector to my TaskForm for the five Kanban columns

9) Help me make add task edit functionality that updates the existing firestore document

10) How should I safely delete a task and remove it from the react state after Firestore confirms?

11) Help me add drag and drop to my TaskMatrix Kanban board.

12) subtasks does not show up in firestore. What could be the reason?

13) How should I handle adding and removing labels in a React form without allowing duplicate labels?

14) How should I structure project members in firestore so I can assign tasks to them?

15) I want to restructure my kanban board logic to let users create their own custom columns.

16) I copied the url of the project of user B, and logged in as user A and pasted it, and it loaded user B's project.

## sprint 16

1) help me setup an api endpoint in my next.js application using gemini api.

2) explain this command:
curl -x post http://localhost:3000/api/ai/subtasks \
  -h "content type: application/json" \
  -d '{"title":"implement firebase authentication","description":"add login and registration using firebase."}'

3) help me integrate ai generated subtasks into my existing taskform without changing the existing task creation flow.

4) help me add a subtask editor to my task creation and task editing ui so users can review and modify ai generated subtasks before saving.

5) help me make taskmatrix responsive for mobile devices and identify the ui changes needed to satisfy the sprint 16 mobile responsiveness requirement.

6) help me implement a responsive hamburger menu for taskmatrix and move the logout action into the mobile navigation.

7) help me make the project cards horizontally scrollable on small screens without causing the entire page to overflow horizontally.

8) help me improve the spacing and layout of the existing taskmatrix task creation form on desktop and mobile without changing its functionality.

9) help me add sonner toast notifications to taskmatrix for successful and failed asynchronous operations such as task creation, editing, deletion, status changes, and ai subtask generation.

10) help me add polished loading states to the existing asynchronous data fetching and mutation operations in taskmatrix without changing the application's architecture or adding new features.

11) Add lucide icons wherever necessary.
