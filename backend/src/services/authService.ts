import { users as usersDb } from '../db/mockDb.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import type { LoginResponse, GoogleOAuthProfile } from '../types/auth.js';

export class AuthService {
  static async handleGoogleOAuth(profile: GoogleOAuthProfile): Promise<LoginResponse> {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        throw new Error('No email provided from Google');
      }

      // Try to find existing user
      let user = usersDb.findByOAuthId('google', profile.id);

      // If not found, create new user
      if (!user) {
        logger.info(`Creating new user via Google OAuth: ${email}`);
        user = usersDb.create({
          email,
          name: profile.displayName || email.split('@')[0] || 'User',
          avatar_url: profile.photos?.[0]?.value,
          oauth_provider: 'google',
          oauth_id: profile.id,
          is_active: true,
        });
      } else {
        // Update existing user with latest info
        user = usersDb.update(user.id, {
          name: profile.displayName || user.name,
          avatar_url: profile.photos?.[0]?.value || user.avatar_url,
        });
      }

      // Generate JWT token
      const token = generateToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        org_id: 'default-org', // In production, would be user's organization
        role: 'member',
      });

      logger.info(`User authenticated: ${email}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
        },
      };
    } catch (error) {
      logger.error('OAuth error:', error);
      throw error;
    }
  }

  static async getProfile(userId: string) {
    const user = usersDb.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      oauth_provider: user.oauth_provider,
    };
  }
}
