import mongoose from 'mongoose';
import { CacheService } from './cacheService';
import { IPathRepository } from '../../data/repositories/IPathRepository';
import { ISectionRepository } from '../../data/repositories/ISectionRepository';

/**
 * Service for managing curriculum (paths, sections, lessons)
 */
export class CurriculumService {
  private pathRepository: IPathRepository;
  private sectionRepository: ISectionRepository;

  constructor(
    pathRepository: IPathRepository,
    sectionRepository: ISectionRepository
  ) {
    this.pathRepository = pathRepository;
    this.sectionRepository = sectionRepository;
  }

  // Path methods
  
  /**
   * Get all learning paths
   */
  async getPaths() {
    const cacheKey = 'paths_all';
    
    return CacheService.getOrSet(cacheKey, async () => {
      return this.pathRepository.findAll();
    });
  }
  
  /**
   * Get a single path by ID or slug
   */
  async getPath(identifier: string) {
    const cacheKey = `path_${identifier}`;
    
    return CacheService.getOrSet(cacheKey, async () => {
      return this.pathRepository.findByIdentifier(identifier);
    });
  }
  
  // Section methods
  
  /**
   * Get sections by path ID
   */
  async getSectionsByPath(pathId: string) {
    const cacheKey = `sections_by_path_${pathId}`;
    
    return CacheService.getOrSet(cacheKey, async () => {
      // If pathId is not a valid ObjectId, it might be a slug
      // First try to find the path by slug
      let actualPathId = pathId;
      
      if (!mongoose.Types.ObjectId.isValid(pathId)) {
        const path = await this.getPath(pathId);
        if (!path) {
          return []; // Path not found
        }
        actualPathId = path._id;
      }
      
      return this.sectionRepository.findByPath(actualPathId);
    });
  }
  
  /**
   * Get a single section by ID or slug
   */
  async getSection(identifier: string, pathId?: string) {
    const cacheKey = `section_${identifier}_${pathId || 'any'}`;
    
    return CacheService.getOrSet(cacheKey, async () => {
      return this.sectionRepository.findByIdentifier(identifier, pathId);
    });
  }
} 