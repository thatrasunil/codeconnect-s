
# Implementation Plan - Team Challenge & Leaderboard

## Goal Description
Implement a robust Team Challenge and Leaderboard system. Users can create teams, invite members, and host private challenges where members compete to solve selected problems. A realtime leaderboard tracks progress based on problem completion and speed.

## User Review Required
> [!IMPORTANT]
> Backend schema update: `teams` collection documents will now include a `memberIds` array to enable efficient "My Teams" querying for both owners and members.

## Proposed Changes

### Backend
#### [MODIFY] [teams.js](file:///d:/codeconnect/backend/routes/teams.js)
- Update `POST /create` to initialize `memberIds` array with `[ownerId]`.
- Update `POST /join` to push `userId` to `memberIds` array.
- Update `GET /my-teams` to query `teams` where `memberIds` array-contains `userId`.
- Ensure `GET /leaderboard` endpoints are robust.

### Frontend
#### [MODIFY] [Teams.js](file:///d:/codeconnect/frontend/src/pages/Teams.js)
- Update to fetch "My Teams" using the improved API.
- Add "Create Team" and "Join Team" (by ID) UI.

#### [MODIFY] [TeamDashboard.js](file:///d:/codeconnect/frontend/src/pages/TeamDashboard.js)
- Display Team Details (Members list).
- List Active/Past Challenges.
- Add "Create Challenge" button (admin only).

#### [NEW] [CreateChallengeModal.js](file:///d:/codeconnect/frontend/src/components/CreateChallengeModal.js)
- Form to input Title, Start/End Time.
- Problem selector (from the 100 list).

#### [MODIFY] [ChallengeView.js](file:///d:/codeconnect/frontend/src/pages/ChallengeView.js)
- layout for specific challenge.
- **Problems Tab**: List of problems with status (Completed/Pending). Clicking navigates to Editor with `teamChallengeId` param.
- **Leaderboard Tab**: Fetch and display ranking.

## Verification Plan
### Automated Tests
- None planned for MVP.

### Manual Verification
1.  **Create Team**: User A creates "Alpha Squad". Verify redirected to Dashboard.
2.  **Join Team**: User B joins "Alpha Squad" using ID. Verify User B sees team in list.
3.  **Create Challenge**: User A creates "Weekend Contest" with 3 problems.
4.  **Solve Problem**: User B solves "Two Sum". Verify submission tagged with `teamChallengeId`.
5.  **Check Leaderboard**: Verify User B appears with 100 points.
