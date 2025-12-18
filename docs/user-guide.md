# User Guide

This guide explains how different users navigate the app and complete key tasks.

## Roles & Access

- Fan: View personal/team info, matches, stats, and chat.
- Coach: Manage team/lineups/players, view and annotate stats, chat.
- Admin: Administrative functions plus all coach capabilities.

### Roles & Permissions Matrix (summary)

| Area | Fan | Coach | Admin |
| --- | --- | --- | --- | --- |
| Landing | View | View | View |
| Auth (Login/Signup) | Yes | Yes | Yes |
| User Dashboard | View | View | View |
| Coach Dashboard | - | Manage | Manage |
| Admin Dashboard | - | - | Manage |
| Teams (setup/roster) | View | Manage | Manage |
| Players (list/details) | View | Manage | Manage |
| Matches (list/details) | View | Manage | Manage |
| Lineups | View | Manage | Manage |
| Chat | Send/Delete own | Send/Delete own | Moderate |
| Reports/Exports | View | Generate | Generate |
| Settings (Profile) | Manage own | Manage own | Manage own |

Note: Actual data-level permissions are enforced by backend policies (RLS) in Supabase.

## Getting Started

1. Visit the landing page.
2. Sign up or log in (Google OAuth supported).
3. After login, you are routed to your dashboard based on role.

## Authentication & Role Selection

- Login: Continue with Google.
- Role Selection: On first sign-in (or when allowed), choose a role (Player/Coach/Admin). Some roles may require approval.
- Protected Routes: Pages like dashboards and management screens require an authenticated session.

## Navigation

Use the sidebar/topbar to access:
- Dashboard
- Matches
- Teams
- Players
- Reports
- Settings

## Dashboards

- User Dashboard: Overview of matches, recent activity, quick links, and chats.
- Coach Dashboard: Team management shortcuts, lineup tasks, player performance, and analytics.
- Admin Dashboard: Org-wide oversight, user/role management, and audit views.

## Teams

- Team Setup: Create or select your team and configure basic details.
- Roster Management: Add/remove players; edit player attributes.
- Favorites: Mark teams/players for quick access.

## Players

- Player List: Browse/search players.
- Player Details: View stats, recent matches, and performance breakdowns.
- Player Stats Modal: Inspect key metrics and history.

## Matches

- Matches List: Browse matches; filter and search.
- Match Details: View scoreline, events, and player contributions.
- Lineup Selection: Assign starters/substitutes; save and update.
- Stats Entry Forms: Submit position-specific stats (GK/DEF/MID/STR) as applicable.

## Chat

- Access chat within a match to view/send messages in real time.
- Your own messages can be deleted by you; admins/coaches may moderate as configured.

## Reports & Exports

- Team Stats Report: Generate and view aggregated analytics (charts/tables).
- Charts: Team performance, shots, and other visualizations.
- Export: Save reports to PDF/image where available.

## Settings

- Profile Settings: Update your profile, preferences, and account details.

## Tips

- Use search and filters in lists where available.
- Real-time updates appear without refresh in supported areas (e.g., Chat).
- Use the Delete control to remove your own chat messages.

## Troubleshooting

- Access denied: Ensure you are logged in and have the correct role.
- Data not updating: Check network connectivity; refresh or re-login.
- Environment issues: Verify backend connectivity and environment variables if self-hosting.
