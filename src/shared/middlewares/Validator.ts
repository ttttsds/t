// src/shared/middlewares/Validator.ts
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

// Types and interfaces
export type ValidationSource = 'body' | 'query' | 'params';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

export interface ValidationField {
  required?: boolean;
  rules: ValidationRule[];
}

export interface ValidationSchema {
  [field: string]: ValidationField;
}

/**
 * Validation service for handling request validation
 */
export class ValidationService {
  /**
   * Validates data against a schema
   */
  static validate(
    schema: ValidationSchema, 
    data: Record<string, unknown>
  ): ValidationResult {
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
  }

  /**
   * Creates a validation middleware
   */
  static createValidator(
    schema: ValidationSchema,
    source: ValidationSource = 'body'
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Get data from the specified source
        const data = req[source] as Record<string, unknown>;
        
        // Validate the data
        const result = ValidationService.validate(schema, data);
        
        if (!result.valid) {
          // Format validation errors
          const formattedErrors = ValidationService.formatErrors(result.errors);
          next(ApiError.badRequest(formattedErrors.message));
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
  }

  /**
   * Formats validation errors for consistent response
   */
  static formatErrors(errors: ValidationError[]): { message: string; details: ValidationError[] } {
    return {
      message: `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
      details: errors
    };
  }
}

// Validation rule utilities
export class ValidationRules {
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }
  
  static isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  
  static minLength(value: string, min: number): boolean {
    return value.length >= min;
  }
  
  static maxLength(value: string, max: number): boolean {
    return value.length <= max;
  }
  
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }
  
  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }
  
  static isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value);
  }
  
  static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  
  static matches(value: string, pattern: RegExp): boolean {
    return pattern.test(value);
  }
}

// Schema factory for better organization
export class SchemaFactory {
  static createSchema(fields: ValidationSchema): ValidationSchema {
    return fields;
  }
}

// Auth Validation Schemas
export const Schemas = {
  Auth: {
    register: SchemaFactory.createSchema({
      firstName: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 2),
            message: 'First name must be at least 2 characters'
          }
        ]
      },
      lastName: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 2),
            message: 'Last name must be at least 2 characters'
          }
        ]
      },
      email: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.isEmail(v),
            message: 'Please provide a valid email'
          }
        ]
      },
      password: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 6),
            message: 'Password must be at least 6 characters'
          }
        ]
      }
    }),
    
    login: SchemaFactory.createSchema({
      email: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.isEmail(v),
            message: 'Please provide a valid email'
          }
        ]
      },
      password: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 1),
            message: 'Password is required'
          }
        ]
      }
    }),
    
    verifyAccount: SchemaFactory.createSchema({
      token: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 1),
            message: 'Token is required'
          }
        ]
      }
    }),
    
    forgotPassword: SchemaFactory.createSchema({
      email: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.isEmail(v),
            message: 'Please provide a valid email'
          }
        ]
      }
    }),
    
    resetPassword: SchemaFactory.createSchema({
      token: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 1),
            message: 'Token is required'
          }
        ]
      },
      password: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 6),
            message: 'Password must be at least 6 characters'
          }
        ]
      }
    }),
    
    resendVerification: SchemaFactory.createSchema({
      email: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.isEmail(v),
            message: 'Please provide a valid email'
          }
        ]
      }
    })
  },
  
  User: {
    updateProfile: SchemaFactory.createSchema({
      firstName: {
        required: false,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 2),
            message: 'First name must be at least 2 characters'
          }
        ]
      },
      lastName: {
        required: false,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 2),
            message: 'Last name must be at least 2 characters'
          }
        ]
      }
    }),
    
    changePassword: SchemaFactory.createSchema({
      currentPassword: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 1),
            message: 'Current password is required'
          }
        ]
      },
      newPassword: {
        required: true,
        rules: [
          {
            validate: (v: unknown) => ValidationRules.isString(v) && ValidationRules.minLength(v, 6),
            message: 'New password must be at least 6 characters'
          }
        ]
      }
    })
  }
};

// For backward compatibility with existing code
export const registerValidator = Schemas.Auth.register;
export const loginValidator = Schemas.Auth.login;
export const verifyAccountValidator = Schemas.Auth.verifyAccount;
export const forgotPasswordValidator = Schemas.Auth.forgotPassword;
export const resetPasswordValidator = Schemas.Auth.resetPassword;
export const resendVerificationValidator = Schemas.Auth.resendVerification;
export const updateProfileValidator = Schemas.User.updateProfile;
export const changePasswordValidator = Schemas.User.changePassword;

// Create middleware factory
export const validate = ValidationService.createValidator;