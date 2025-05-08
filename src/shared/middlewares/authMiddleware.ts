import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Ensure env variables are loaded
dotenv.config();

// Properly typed token payload
interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

// Constants
const JWT_SECRET = process.env.JWT_SECRET as string;
const PUBLIC_ENDPOINTS = [
  '/auth/register',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-account',
  '/auth/resend-verification'
];

const PUBLIC_GET_ENDPOINTS = [
  '/curriculum/paths',
  '/curriculum/courses',
  '/curriculum/sections',
  '/curriculum/lessons'
];

/**
 * Authentication middleware factory
 * Returns middleware functions for different authentication strategies
 */
export const AuthMiddleware = {
  /**
   * Checks if a route is publicly accessible
   */
  isPublicRoute(path: string, method: string): boolean {
    // Check fully public endpoints
    if (PUBLIC_ENDPOINTS.some(endpoint => path.includes(endpoint) || path.startsWith(endpoint))) {
      return true;
    }
    
    // Check partially public endpoints (GET only)
    if (method === 'GET' && 
        PUBLIC_GET_ENDPOINTS.some(endpoint => path.includes(endpoint) || path.startsWith(endpoint)) &&
        !path.includes('/progress')) {
      return true;
    }
    
    return false;
  },
  
  /**
   * Extracts and validates the JWT token from request headers
   */
  extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    return token || null;
  },
  
  /**
   * Verifies the JWT token and returns the decoded payload
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Main authentication middleware
   * Protects routes that require authentication
   */
  protect(req: Request, res: Response, next: NextFunction): void {
    // Check if route is public
    if (AuthMiddleware.isPublicRoute(req.path, req.method)) {
      next();
      return;
    }
    
    // Extract token
    const token = AuthMiddleware.extractToken(req);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    // Verify token
    const decoded = AuthMiddleware.verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }
    
    // Check token expiration explicitly
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
      return;
    }
    
    // Attach user to request
    req.user = { id: decoded.id };
    next();
  },
  
  /**
   * Optional authentication middleware
   * Attaches user to request if token is valid, but doesn't block if no token
   */
  optional(req: Request, res: Response, next: NextFunction): void {
    const token = AuthMiddleware.extractToken(req);
    
    if (token) {
      const decoded = AuthMiddleware.verifyToken(token);
      if (decoded) {
        req.user = { id: decoded.id };
      }
    }
    
    next();
  }
};

// Export the main middleware function for DI with explicit RequestHandler type
export const authMiddleware: RequestHandler = AuthMiddleware.protect; 