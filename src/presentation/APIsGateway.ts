// src/presentation/APIsGateway.ts
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { DI } from '../core/container';
import { 
  validate, 
  registerValidator, 
  loginValidator, 
  verifyAccountValidator, 
  forgotPasswordValidator, 
  resetPasswordValidator,
  resendVerificationValidator,
  updateProfileValidator,
  changePasswordValidator
} from '../shared/middlewares/Validator';

import { cleanPathDTO, cleanSectionDTO, cleanLessonDTO, mapToDTO } from '../shared/utils/dtoUtils';

// Get auth middleware for protected routes
const authMiddleware = DI.authMiddleware;

// Initialize the gateway router
const router = Router();

// =========================================================================
// PUBLIC AUTH ROUTES
// =========================================================================

router.post('/auth/register', validate(registerValidator), DI.authController.register);
router.post('/auth/verify-account', validate(verifyAccountValidator), DI.authController.verifyAccount);
router.post('/auth/login', validate(loginValidator), DI.authController.login);
router.post('/auth/forgot-password', validate(forgotPasswordValidator), DI.authController.forgotPassword);
router.post('/auth/reset-password', validate(resetPasswordValidator), DI.authController.resetPassword);
router.post('/auth/resend-verification', validate(resendVerificationValidator), DI.authController.resendVerification);

// =========================================================================
// PUBLIC CURRICULUM ROUTES
// =========================================================================

// Path endpoints
router.get('/curriculum/paths', async (req: Request, res: Response) => {
  try {
    const paths = await DI.curriculumService.getPaths();
    
    // Clean up the data before sending to client
    const cleanPaths = mapToDTO(paths, cleanPathDTO);
    
    res.status(200).json({
      success: true,
      count: cleanPaths.length,
      data: cleanPaths
    });
  } catch (error) {
    console.error('Error fetching paths:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.get('/curriculum/paths/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const path = await DI.curriculumService.getPath(identifier);
    
    if (!path) {
      res.status(404).json({
        success: false,
        error: 'Path not found'
      });
      return;
    }
    
    // Clean up the data before sending to client
    const cleanPath = cleanPathDTO(path);
    
    res.status(200).json({
      success: true,
      data: cleanPath
    });
  } catch (error) {
    console.error('Error fetching path:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Legacy support - map /paths to /curriculum/paths
router.get('/paths', async (req, res) => {
  try {
    const paths = await DI.curriculumService.getPaths();
    
    // Clean up the data before sending to client
    const cleanPaths = mapToDTO(paths, cleanPathDTO);
    
    res.status(200).json({
      success: true,
      count: cleanPaths.length,
      data: cleanPaths
    });
  } catch (error) {
    console.error('Error fetching paths:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.get('/paths/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const path = await DI.curriculumService.getPath(identifier);
    
    if (!path) {
      res.status(404).json({
        success: false,
        error: 'Path not found'
      });
      return;
    }
    
    // Clean up the data before sending to client
    const cleanPath = cleanPathDTO(path);
    
    res.status(200).json({
      success: true,
      data: cleanPath
    });
  } catch (error) {
    console.error('Error fetching path:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Section endpoints
router.get('/curriculum/paths/:pathId/sections', async (req: Request, res: Response) => {
  try {
    const { pathId } = req.params;
    
    // First check if path exists
    const path = await DI.curriculumService.getPath(pathId);
    
    if (!path) {
      res.status(404).json({
        success: false,
        error: 'Path not found'
      });
      return;
    }
    
    const sections = await DI.curriculumService.getSectionsByPath(pathId);
    
    // Clean up the data before sending to client
    const cleanSections = mapToDTO(sections, cleanSectionDTO);
    
    res.status(200).json({
      success: true,
      count: cleanSections.length,
      data: cleanSections
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Lesson endpoints
router.get('/curriculum/sections/:sectionId/lessons', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const lessons = await DI.lessonService.getLessonsBySection(sectionId);
    
    // Clean up the data before sending to client
    const cleanLessons = mapToDTO(lessons, cleanLessonDTO);
    
    res.status(200).json({
      success: true,
      count: cleanLessons.length,
      data: cleanLessons
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.get('/curriculum/lessons/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const { sectionId } = req.query;
    const isRawContent = req.query.raw === 'true';
    
    const lesson = await DI.lessonService.getLesson(
      identifier, 
      sectionId as string | undefined
    );
    
    if (!lesson) {
      res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
      return;
    }
    
    // If raw content requested, return unprocessed content
    if (isRawContent) {
      try {
        const rawContent = await DI.contentService.getRawContent(lesson._id);

        // Create a clean lesson object with the raw content
        const lessonWithRawContent = {
          ...cleanLessonDTO(lesson),
          content: rawContent.content,
          contentFormat: rawContent.format
        };
        
        res.status(200).json({
          success: true,
          data: lessonWithRawContent
        });
        return;
      } catch (rawError) {
        console.error('Error getting raw content:', rawError);
        // Fall back to standard lesson if raw content fails
      }
    }
    
    // Clean up the data before sending to client
    const cleanLesson = cleanLessonDTO(lesson);
    
    res.status(200).json({
      success: true,
      data: cleanLesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.get('/curriculum/lessons/:lessonId/content', async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    
    const renderedContent = await DI.contentService.getRenderedContent(lessonId);

    // We don't need to clean this as it's already a simplified content object
    res.status(200).json({
      success: true,
      data: renderedContent
    });
  } catch (error) {
    console.error('Error fetching lesson content:', error);
    
    // Check if lesson not found error
    if ((error as Error).message.includes('Lesson not found')) {
      res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// =========================================================================
// APPLY AUTHENTICATION MIDDLEWARE
// =========================================================================

// Use a typed middleware wrapper that's compatible with Express's router.use
const protectRoutes: RequestHandler = (req, res, next) => {
  authMiddleware(req, res, next);
};

// Apply auth middleware
router.use(protectRoutes);

// =========================================================================
// PROTECTED AUTH ROUTES
// =========================================================================

router.get('/auth/me', DI.authController.getCurrentUser);

// =========================================================================
// PROTECTED USER ROUTES
// =========================================================================

router.get('/users/profile', DI.userController.getUserProfile);
router.patch('/users/profile', validate(updateProfileValidator), DI.userController.updateUserProfile);
router.post('/users/change-password', validate(changePasswordValidator), DI.userController.changePassword);

// =========================================================================
// PROTECTED CURRICULUM ROUTES (PROGRESS TRACKING)
// =========================================================================

router.post('/curriculum/lessons/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    // If no user is authenticated, return error
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    // Mark lesson as completed using injected service
    const completion = await DI.lessonService.markLessonCompleted(id, userId);
    
    // Create a simplified completion object
    const cleanCompletion = {
      _id: completion._id,
      lessonId: completion.lessonId,
      userId: completion.userId
    };
    
    res.status(200).json({
      success: true,
      data: cleanCompletion
    });
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    
    // Check if lesson not found error
    if ((error as Error).message.includes('Lesson not found')) {
      res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
      return;
    }
    
    // Check if user not found error
    if ((error as Error).message.includes('User not found')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.get('/curriculum/sections/:sectionId/progress', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const userId = (req as any).user?.id;
    
    // If no user is authenticated, return error
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    // Use injected service for progress
    const progress = await DI.lessonService.getUserSectionProgress(userId, sectionId);
    
    // Progress data is already in a clean format
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting user section progress:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.get('/curriculum/paths/:pathId/progress', async (req: Request, res: Response) => {
  try {
    const { pathId } = req.params;
    const userId = (req as any).user?.id;
    
    // If no user is authenticated, return error
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    // Use injected service for progress
    const progress = await DI.lessonService.getUserPathProgress(userId, pathId);
    
    // Progress data is already in a clean format
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting user path progress:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

router.get('/curriculum/lessons/:id/inspect', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    // If no user is authenticated, return error
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    // Check if lesson is completed using injected service
    const isCompleted = await DI.lessonService.isLessonCompleted(userId, id);
    
    // If completed, get the completion details for consistency
    let completionData = null;
    if (isCompleted) {
      const completion = await DI.lessonCompletionRepository.findOne(userId, id);
      if (completion) {
        completionData = {
          _id: completion._id,
          lessonId: completion.lessonId,
          userId: completion.userId
        };
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        isCompleted,
        completion: completionData
      }
    });
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;