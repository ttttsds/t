// src/shared/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { ITokenService } from '../services/ITokenService';
import { IUserRepository } from '../../data/repositories/IUserRepository';
import { IAuthMiddleware } from './IAuthMiddleware';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export class AuthMiddleware implements IAuthMiddleware {
  private tokenService: ITokenService;
  private userRepository: IUserRepository;

  constructor(
    tokenService: ITokenService,
    userRepository: IUserRepository
  ) {
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Not authorized to access this route');
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = this.tokenService.verifyToken(token);
      
      // Check if user still exists
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user) {
        throw ApiError.unauthorized('The user belonging to this token no longer exists');
      }
      
      // Set user on request
      req.user = {
        id: user.id
      };
      
      next();
    } catch (error) {
      next(ApiError.unauthorized('Not authorized to access this route'));
    }
  };
}