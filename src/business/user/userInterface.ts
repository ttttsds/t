// src/modules/user/userInterface.ts
export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
  }
  
  export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
  }
  
  export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }