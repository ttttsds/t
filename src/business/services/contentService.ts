import { IContentFormat } from '../../data/mongodb/models/lessonModel';
import mongoose from 'mongoose';
import { CacheService } from './cacheService';
import { IContentRepository } from '../../data/repositories/IContentRepository';
import sanitizeHtml from 'sanitize-html';
import { processMarkdown } from './markdownService';

/**
 * Service for managing lesson content
 */
export class ContentService {
  private contentRepository: IContentRepository;

  constructor(contentRepository: IContentRepository) {
    this.contentRepository = contentRepository;
  }

  /**
   * Get rendered lesson content with caching
   */
  async getRenderedContent(lessonId: string): Promise<{ 
    content: string, 
    format?: 'markdown' | 'html'
  }> {
    const cacheKey = `lesson_content_${lessonId}`;
    
    return CacheService.getOrSet(cacheKey, async () => {
      const lesson = await this.contentRepository.findLessonById(lessonId);
      
      if (!lesson) {
        throw new Error(`Lesson not found: ${lessonId}`);
      }
      
      // Process the main content
      const { renderedContent, format: contentFormat } = this.renderContent(lesson.content);
      
      // Update the lesson with rendered content (for future use)
      await this.contentRepository.updateLessonContent(
        lessonId,
        lesson.content,
        renderedContent
      );
      
      return {
        content: renderedContent,
        format: contentFormat
      };
    });
  }
  
  /**
   * Render content based on its format
   * @param content The content to render (string or IContentFormat)
   * @returns The rendered HTML and format type
   */
  private renderContent(content: string | any): { 
    renderedContent: string, 
    format: 'markdown' | 'html' 
  } {
    // Check if content is an object with the right format properties
    if (typeof content === 'object' && content !== null && 
        'raw' in content && 'format' in content) {
      const contentObj = content as IContentFormat;
      
      // If we already have rendered HTML and it was rendered recently (less than 1 hour ago)
      if (contentObj.html && contentObj.lastRenderedAt) {
        const cacheAge = Date.now() - new Date(contentObj.lastRenderedAt).getTime();
        // If the cache is less than 1 hour old, use it
        if (cacheAge < 3600000) {
          return { 
            renderedContent: contentObj.html,
            format: contentObj.format
          };
        }
      }
      
      // Otherwise render based on format
      if (contentObj.format === 'html') {
        const sanitized = sanitizeHtml(contentObj.raw);
        return { renderedContent: sanitized, format: 'html' };
      } else {
        return { 
          renderedContent: processMarkdown(contentObj.raw),
          format: 'markdown'
        };
      }
    }
    
    // If content is a string or any other type, convert to string
    const contentStr = typeof content === 'string' ? content : 
      (typeof content === 'object' && content !== null && 'raw' in content) ? 
        content.raw : String(content);
    
    // Look for HTML indicators
    const isHtml = contentStr.trim().startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(contentStr);
    
    if (isHtml) {
      const sanitized = sanitizeHtml(contentStr);
      return { renderedContent: sanitized, format: 'html' };
    } else {
      return { 
        renderedContent: processMarkdown(contentStr),
        format: 'markdown'
      };
    }
  }
  
  /**
   * Update lesson content
   */
  async updateLessonContent(
    lessonId: string,
    content: string | any,
    userId: string,
    changeDescription: string = 'Updated content'
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Determine content format
      let contentObj: IContentFormat;
      let format: 'markdown' | 'html' = 'markdown';
      
      if (typeof content === 'string') {
        // Detect if content is HTML
        const isHtml = content.trim().startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(content);
        format = isHtml ? 'html' : 'markdown';
        
        contentObj = {
          raw: content,
          format,
          lastRenderedAt: new Date()
        };
      } else if (typeof content === 'object' && content !== null && 
                'raw' in content && 'format' in content) {
        // It's already in the IContentFormat structure
        const formattedContent = content as IContentFormat;
        contentObj = {
          raw: formattedContent.raw,
          format: formattedContent.format,
          html: formattedContent.html,
          lastRenderedAt: new Date()
        };
        format = formattedContent.format;
      } else {
        // Default case if content is not in expected format
        contentObj = {
          raw: String(content),
          format: 'markdown',
          lastRenderedAt: new Date()
        };
      }
      
      // Find existing lesson
      const lesson = await this.contentRepository.findLessonById(lessonId);
      
      if (!lesson) {
        throw new Error(`Lesson not found: ${lessonId}`);
      }
      
      // Render new content for cache
      const { renderedContent } = this.renderContent(contentObj);
      
      // Update the lesson
      const updates = {
        content: contentObj,
        renderedContent,
        lastRenderedAt: new Date()
      };

      const updatedLesson = await this.contentRepository.updateLessonWithSession(
        lessonId,
        updates,
        session
      );
      
      await session.commitTransaction();
      
      // Invalidate cache
      CacheService.delete(`lesson_content_${lessonId}`);
      CacheService.deleteByPattern(`^lesson_${lessonId}`);
      
      return updatedLesson;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Get raw content for a lesson
   */
  async getRawContent(lessonId: string): Promise<{
    content: string | any,
    format: 'markdown' | 'html'
  }> {
    const lesson = await this.contentRepository.findLessonById(lessonId);
    
    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }
    
    // Determine the format
    let format: 'markdown' | 'html' = 'markdown';
    let content: string | any = '';
    
    if (typeof lesson.content === 'object' && lesson.content !== null && 
        'format' in lesson.content) {
      const contentObj = lesson.content as IContentFormat;
      format = contentObj.format;
      content = lesson.content;
    } else {
      // For backward compatibility with string content
      content = String(lesson.content);
      const isHtml = content.trim().startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(content);
      format = isHtml ? 'html' : 'markdown';
    }
    
    return {
      content,
      format
    };
  }
} 