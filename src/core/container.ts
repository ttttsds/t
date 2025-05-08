import { UserRepository } from '../data/repositories/user.repository';
import { LessonCompletionRepository } from '../data/repositories/lessonCompletion.repository';
import { LessonRepository } from '../data/repositories/lesson.repository';
import { PathRepository } from '../data/repositories/path.repository';
import { SectionRepository } from '../data/repositories/section.repository';
import { ContentRepository } from '../data/repositories/content.repository';

import TokenService from '../shared/services/TokenService'; 
import EmailService from '../shared/services/EmailService';
import HashService from '../shared/services/HashService';

import { AuthService } from '../business/auth/authService';
import { UserService } from '../business/user/userService';
import { LessonService } from '../business/services/lessonService';
import { ContentService } from '../business/services/contentService';
import { CurriculumService } from '../business/services/curriculumService';

import { AuthController } from '../business/auth/authController';
import { UserController } from '../business/user/userController';
import { authMiddleware } from '../shared/middlewares/authMiddleware';

// Create repository instances
const userRepository = new UserRepository();
const lessonCompletionRepository = new LessonCompletionRepository();
const lessonRepository = new LessonRepository();
const pathRepository = new PathRepository();
const sectionRepository = new SectionRepository();
const contentRepository = new ContentRepository();

// Create services with repository dependencies
const authService = new AuthService(userRepository, TokenService, EmailService, HashService);
const userService = new UserService(userRepository, HashService);
const lessonService = new LessonService(
  lessonCompletionRepository, 
  lessonRepository,
  userRepository,
  sectionRepository
);
const contentService = new ContentService(contentRepository);
const curriculumService = new CurriculumService(pathRepository, sectionRepository);

// Create controllers
const authController = new AuthController(authService);
const userController = new UserController(userService);

// Export as plain object instead of using Container
export const DI = {
  // Repositories
  userRepository,
  lessonCompletionRepository,
  lessonRepository,
  pathRepository,
  sectionRepository,
  contentRepository,
  
  // Services
  authService,
  userService,
  lessonService,
  contentService,
  curriculumService,
  
  // Middleware
  authMiddleware,
  
  // Controllers
  authController,
  userController
};