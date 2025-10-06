import { env } from '../config';

export interface UpdateUserPayload {
  bio?: string;
  profileImage?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  // add other updatable fields as needed
}

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  const base = (env.API_URL || 'http://localhost:3001').replace(/\/$/, '');
  const res = await fetch(`${base}/api/user/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to update user');
  }

  return res.json();
}
