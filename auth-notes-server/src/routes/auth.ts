import express from 'express';
import { signup, login, googleAuth, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { signupValidation, loginValidation } from '../utils/validation';

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/google', googleAuth);
router.get('/profile', authenticate, getProfile);

export default router;