import { Router } from 'express';

export const authRoutes = Router();

authRoutes.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - TODO' });
});

authRoutes.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - TODO' });
});

authRoutes.get('/profile', (req, res) => {
  res.json({ message: 'Get profile endpoint - TODO' });
});
