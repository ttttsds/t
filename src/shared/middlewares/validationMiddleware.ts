import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

/**
 * Middleware to validate request using express-validator
 * @param validations An array of validation chains
 * @returns Express middleware function
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }

    // Check if there are validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Return validation errors
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
}; 