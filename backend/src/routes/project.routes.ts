import express from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes - token gerektirmeyen
router.get('/', ProjectController.getProjects);

// Protected routes - token gerektiren
router.use(authMiddleware); // Bundan sonraki tüm rotalar için auth gerekir
router.post('/', ProjectController.createProject);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
router.get('/user/:userId', ProjectController.getUserProjects);
router.get('/:id', ProjectController.getProjectById);

export default router; 