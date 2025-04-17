export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
}

export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  isVerified?: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}
