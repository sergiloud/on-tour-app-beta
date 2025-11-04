import { Router } from 'express';

export const financeRoutes = Router();

financeRoutes.get('/overview', (req, res) => {
  res.json({ message: 'Finance overview - TODO' });
});

financeRoutes.post('/records', (req, res) => {
  res.json({ message: 'Create finance record - TODO' });
});

financeRoutes.get('/records/:showId', (req, res) => {
  res.json({ message: 'Get finance records - TODO' });
});

financeRoutes.post('/settlement', (req, res) => {
  res.json({ message: 'Create settlement - TODO' });
});
