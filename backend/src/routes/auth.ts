import { Router } from 'express';
import { asyncHandler, authMiddleware } from '../middleware/errorHandler.js';
import { AuthService } from '../services/authService.js';
import type { GoogleOAuthProfile } from '../types/auth.js';

export const authRoutes = Router();

// Mock Google OAuth callback for development
// In production, this would be handled by Passport.js middleware
authRoutes.post(
  '/google/callback',
  asyncHandler(async (req: any, res: any) => {
    const profile: GoogleOAuthProfile = req.body;
    const result = await AuthService.handleGoogleOAuth(profile);
    res.json(result);
  })
);

// Login with mock profile (for testing)
authRoutes.post(
  '/login',
  asyncHandler(async (req: any, res: any) => {
    const profile: GoogleOAuthProfile = {
      id: req.body.oauth_id || 'test-oauth-id',
      displayName: req.body.name || 'Test User',
      emails: [{ value: req.body.email }],
      photos: [{ value: req.body.avatar_url || '' }],
    };
    const result = await AuthService.handleGoogleOAuth(profile);
    res.json(result);
  })
);

// Get user profile
authRoutes.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;
    const profile = await AuthService.getProfile(user.sub);
    res.json(profile);
  })
);

// Logout (just returns success - JWT is stateless)
authRoutes.post(
  '/logout',
  asyncHandler(async (req: any, res: any) => {
    res.json({ success: true, message: 'Logged out successfully' });
  })
);
