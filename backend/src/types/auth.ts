export interface AuthPayload {
  sub: string; // user ID
  email: string;
  name: string;
  org_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password?: string;
  oauth_provider: string;
  oauth_id: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  };
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  oauth_provider: string;
}

export interface GoogleOAuthProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
}
