import { Request, Response, NextFunction } from 'express';
import { IUserRepository } from '../../data/repositories/IUserRepository';

export interface IAuthMiddleware {
  protect(req: Request, res: Response, next: NextFunction): Promise<void>;
}
