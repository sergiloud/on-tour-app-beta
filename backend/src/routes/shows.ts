import { Router } from 'express';

export const showsRoutes = Router();

showsRoutes.get('/', (req, res) => {
  res.json({ message: 'List shows - TODO' });
});

showsRoutes.post('/', (req, res) => {
  res.json({ message: 'Create show - TODO' });
});

showsRoutes.get('/:id', (req, res) => {
  res.json({ message: 'Get show - TODO' });
});

showsRoutes.put('/:id', (req, res) => {
  res.json({ message: 'Update show - TODO' });
});

showsRoutes.delete('/:id', (req, res) => {
  res.json({ message: 'Delete show - TODO' });
});
