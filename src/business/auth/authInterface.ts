// src/modules/auth/authInterface.ts
export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
  
  export interface LoginDto {
    email: string;
    password: string;
  }
  
  export interface VerifyAccountDto {
    token: string;
  }
  
  export interface ResendVerificationDto {
    email: string;
  }
  
  export interface ForgotPasswordDto {
    email: string;
  }
  
  export interface ResetPasswordDto {
    token: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      isVerified: boolean;
    };
  }