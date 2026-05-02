export interface LocalUser {
  email: string;
  password: string;
  emailVerified: boolean;
}

export interface SessionUser {
  email: string;
  emailVerified: boolean;
}

const USERS_KEY = 'salone_users';
const SESSION_KEY = 'salone_session_user';

const readUsers = (): LocalUser[] => {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as LocalUser[];
  } catch {
    return [];
  }
};

const writeUsers = (users: LocalUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = (email: string, password: string): { ok: true } | { ok: false; reason: 'exists' } => {
  const users = readUsers();
  const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    return { ok: false, reason: 'exists' };
  }

  users.push({ email, password, emailVerified: true });
  writeUsers(users);
  return { ok: true };
};

export const authenticateUser = (
  email: string,
  password: string
): { ok: true; user: SessionUser } | { ok: false; reason: 'invalid' } => {
  const users = readUsers();
  const found = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);

  if (!found) {
    return { ok: false, reason: 'invalid' };
  }

  return {
    ok: true,
    user: { email: found.email, emailVerified: true },
  };
};

export const loginWithGoogle = (): SessionUser => ({
  email: 'google.user@example.com',
  emailVerified: true,
});

export const getSessionUser = (): SessionUser | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

export const setSessionUser = (user: SessionUser) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSessionUser = () => {
  localStorage.removeItem(SESSION_KEY);
};
