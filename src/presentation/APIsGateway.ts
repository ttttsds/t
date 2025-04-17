// src/modules/user/userRoute.ts
import { Router } from 'express';
import { DI } from '../core/container';
import { 
  validate, 
  registerValidator, 
  loginValidator, 
  verifyAccountValidator, 
  forgotPasswordValidator, 
  resetPasswordValidator,
  updateProfileValidator,
  changePasswordValidator,
  resendVerificationValidator
} from '../shared/middlewares/Validator';

const router = Router();

// Use manual DI instead of container.get()
const authController = DI.authController;
const userController = DI.userController;
const authMiddleware = DI.authMiddleware;

// Public routes first (no authentication required)
router.post('/auth/register', validate(registerValidator), authController.register);
router.post('/auth/verify-account', validate(verifyAccountValidator), authController.verifyAccount);
router.post('/auth/login', validate(loginValidator), authController.login);
router.post('/auth/forgot-password', validate(forgotPasswordValidator), authController.forgotPassword);
router.post('/auth/reset-password', validate(resetPasswordValidator), authController.resetPassword);
router.post('/auth/resend-verification', validate(resendVerificationValidator), authController.resendVerification);

// Protected routes - require authentication
router.use(authMiddleware.protect);
router.get('/users/profile', userController.getUserProfile);
router.patch('/users/profile', validate(updateProfileValidator), userController.updateUserProfile);
router.post('/users/change-password', validate(changePasswordValidator), userController.changePassword);
router.get('/auth/me', authController.getCurrentUser);

export default router;