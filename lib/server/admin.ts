import { getCurrentUser, type SessionUser } from "./auth";

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminUser = (user: Pick<SessionUser, "email"> | null | undefined) => {
  if (!user) {
    return false;
  }

  return getAdminEmails().includes(user.email.toLowerCase());
};

export const requireAdmin = async () => {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return null;
  }

  return user;
};
