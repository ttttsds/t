// src/shared/middlewares/Validator.ts
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

// Simple validation utility functions
const isString = (value: unknown): value is string => typeof value === 'string';
const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const minLength = (value: string, min: number): boolean => value.length >= min;

// Schema type definitions
interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

interface ValidationField {
  required?: boolean;
  rules: ValidationRule[];
}

interface ValidationSchema {
  [field: string]: ValidationField;
}

// Schema validation function
const validateSchema = (schema: ValidationSchema, data: Record<string, unknown>): ValidationResult => {
  const errors: ValidationError[] = [];

  for (const [field, validation] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if required
    if (validation.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`
      });
      continue;
    }

    // Skip validation if field is not required and value is not provided
    if (!validation.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Check all rules
    for (const rule of validation.rules) {
      if (!rule.validate(value)) {
        errors.push({
          field,
          message: rule.message
        });
        break; // Stop at first validation error for this field
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Auth Validation Schemas
export const registerValidator = {
  firstName: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 2),
        message: 'First name must be at least 2 characters'
      }
    ]
  },
  lastName: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 2),
        message: 'Last name must be at least 2 characters'
      }
    ]
  },
  email: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && isEmail(v),
        message: 'Please provide a valid email'
      }
    ]
  },
  password: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 6),
        message: 'Password must be at least 6 characters'
      }
    ]
  }
};

export const loginValidator = {
  email: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && isEmail(v),
        message: 'Please provide a valid email'
      }
    ]
  },
  password: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 1),
        message: 'Password is required'
      }
    ]
  }
};

export const verifyAccountValidator = {
  token: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 1),
        message: 'Token is required'
      }
    ]
  }
};

export const forgotPasswordValidator = {
  email: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && isEmail(v),
        message: 'Please provide a valid email'
      }
    ]
  }
};

export const resetPasswordValidator = {
  token: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 1),
        message: 'Token is required'
      }
    ]
  },
  password: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 6),
        message: 'Password must be at least 6 characters'
      }
    ]
  }
};

export const resendVerificationValidator = {
  email: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && isEmail(v),
        message: 'Please provide a valid email'
      }
    ]
  }
};

// User Validation Schemas
export const updateProfileValidator = {
  firstName: {
    required: false,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 2),
        message: 'First name must be at least 2 characters'
      }
    ]
  },
  lastName: {
    required: false,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 2),
        message: 'Last name must be at least 2 characters'
      }
    ]
  }
};

export const changePasswordValidator = {
  currentPassword: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 1),
        message: 'Current password is required'
      }
    ]
  },
  newPassword: {
    required: true,
    rules: [
      {
        validate: (v: unknown) => isString(v) && minLength(v, 6),
        message: 'New password must be at least 6 characters'
      }
    ]
  }
};

// Validation middleware
export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = validateSchema(schema, req.body);
      
      if (!result.valid) {
        // Check if ApiError.badRequest accepts a second parameter
        // If not, convert errors to string message
        const errorMessage = `Validation error: ${result.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`;
        next(ApiError.badRequest(errorMessage));
        return;
      }
      
      next();
    } catch (error) {
      if (error instanceof Error) {
        next(ApiError.badRequest(error.message));
      } else {
        next(ApiError.badRequest('Validation error'));
      }
    }
  };
};