import { UserRepository } from '../data/repositories/user.repository';
import TokenService from '../shared/services/TokenService'; 
import EmailService from '../shared/services/EmailService';
import HashService from '../shared/services/HashService';
import { AuthService } from '../business/auth/authService';
import { UserService } from '../business/user/userService';
import { AuthController } from '../business/auth/authController';
import { UserController } from '../business/user/userController';
import { AuthMiddleware } from '../shared/middlewares/AuthMiddleware';

// Create a new instance of the MongoDB repository
const userRepository = new UserRepository();
const authService = new AuthService(userRepository, TokenService, EmailService, HashService);
const userService = new UserService(userRepository, HashService);
const authMiddleware = new AuthMiddleware(TokenService, userRepository);

const authController = new AuthController(authService);
const userController = new UserController(userService);

// Export as plain object instead of using Container
export const DI = {
  userRepository,
  authService,
  userService,
  authMiddleware,
  authController,
  userController
};