import { Router } from 'express';

export const usersRoutes = Router();

usersRoutes.get('/', (req, res) => {
  res.json({ message: 'List users - TODO' });
});

usersRoutes.get('/:id', (req, res) => {
  res.json({ message: 'Get user - TODO' });
});

usersRoutes.put('/:id', (req, res) => {
  res.json({ message: 'Update user - TODO' });
});

usersRoutes.delete('/:id', (req, res) => {
  res.json({ message: 'Delete user - TODO' });
});
