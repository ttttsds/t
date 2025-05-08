import { Request, Response, NextFunction } from 'express';
import { ILessonController } from './ILessonController';
import { cleanLessonDTO, mapToDTO } from '../../shared/utils/dtoUtils';

export class LessonController implements ILessonController {
  constructor(
    private lessonService: any,
    private contentService: any
  ) {}

  getLessonsBySection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sectionId } = req.params;
      
      // Add validation to check if sectionId exists
      if (!sectionId) {
        res.status(400).json({
          success: false,
          error: 'Section ID is required'
        });
        return;
      }
      
      const lessons = await this.lessonService.getLessonsBySection(sectionId);
      
      // Clean up the data before sending to client
      const cleanLessons = mapToDTO(lessons, cleanLessonDTO);
      
      res.status(200).json({
        success: true,
        count: cleanLessons.length,
        data: cleanLessons
      });
    } catch (error) {
      next(error);
    }
  };

  getLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = req.params;
      const { sectionId } = req.query;
      const isRawContent = req.query.raw === 'true';
      
      const lesson = await this.lessonService.getLesson(
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
          const rawContent = await this.contentService.getRawContent(lesson._id);

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
      next(error);
    }
  };

  getLessonContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonId } = req.params;
      
      const renderedContent = await this.contentService.getRenderedContent(lessonId);

      // We don't need to clean this as it's already a simplified content object
      res.status(200).json({
        success: true,
        data: renderedContent
      });
    } catch (error) {
      // Check if lesson not found error
      if ((error as Error).message.includes('Lesson not found')) {
        res.status(404).json({
          success: false,
          error: 'Lesson not found'
        });
        return;
      }
      
      next(error);
    }
  };

  markLessonAsCompleted = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }
      
      await this.lessonService.markLessonAsCompleted(lessonId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Lesson marked as completed'
      });
    } catch (error) {
      next(error);
    }
  };

  getUserLessonProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }
      
      const progress = await this.lessonService.getUserProgress(userId);
      
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      next(error);
    }
  };
} 