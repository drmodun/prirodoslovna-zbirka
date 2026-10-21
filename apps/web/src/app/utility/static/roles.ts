// Platform roles as the API reports them (`User.role`: SUPER / ADMIN / USER).
// SUPER can do everything; ADMIN is a platform moderator that passes content
// checks (exponats, posts, works, social posts, quizzes) but cannot manage
// users or organisation memberships.
export const isSuperRole = (role?: string | null) =>
  role?.toLowerCase() === "super";

export const isModeratorRole = (role?: string | null) =>
  isSuperRole(role) || role?.toLowerCase() === "admin";
