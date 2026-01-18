
# Walkthrough - Team Challenge & Leaderboard

## Overview
I have implemented the **Team Challenge and Leaderboard** feature! This allows users to create teams, invite members, and host private coding challenges.

### Features Added
1.  **Teams Management**:
    *   **Create Team**: Create a new team with a name.
    *   **Join Team**: Join an existing team using its unique ID (Invite Code).
    *   **My Teams**: View all teams you own or have joined.

2.  **Team Dashboard**:
    *   View active challenges.
    *   View team members and their roles.
    *   **Create Challenge** (Owner only): Create a new challenge by selecting problems from the library and setting an end time.

3.  **Challenge Mode**:
    *   **Challenge View**: A dedicated page for a specific challenge.
    *   **Problems List**: Lists only the problems selected for this challenge.
    *   **Live Leaderboard**: Real-time ranking of team members based on problems solved and score.

4.  **Integrated Scoring**:
    *   Submissions made via the Challenge page are automatically tagged with the `teamChallengeId`.
    *   Scores are calculated dynamically based on unique problems solved (100 points per problem).

## How to Test
1.  Navigate to **/teams**.
2.  Click **Create New Team** and give it a name (e.g., "Code Warriors").
3.  Copy the **Team ID** from the dashboard header.
4.  Open an incognito window or log in as a different user, go to **/teams**, and paste the Team ID into the **Join** box.
5.  As the owner, click **+ New Challenge**, select a few problems (e.g., "Two Sum", "Valid Anagram"), and click Create.
6.  Click on the challenge card to enter the **Challenge View**.
7.  Select a problem from the list. It will open the Editor.
8.  Solve the problem and submit.
9.  Return to the **Challenge View** and switch to the **Leaderboard** tab to see your score!

## Technical Details
-   **Backend**: Updated `teams.js` to support `memberIds` array for efficient "My Teams" lookup. added `teamChallengeId` support in `problems.js`.
-   **Frontend**: Created `CreateChallengeModal`, updated `Teams.js` and `TeamDashboard.js`, and fixed navigation in `ChallengeView.js`.
-   **Schema**:
    -   `teams`: `{ name, ownerId, members: { uid: role }, memberIds: [uid] }`
    -   `teamChallenges`: `{ teamId, problemIds, startTime, endTime }`
    -   `solutions` (updated): Now includes `teamChallengeId`.

## Mobile Responsiveness
All new pages use glassmorphism cards and responsive layouts consistent with the rest of the application.
