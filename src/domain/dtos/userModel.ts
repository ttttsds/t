export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

export interface UserCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserAuthResponseDto {
  user: Omit<User, 'password'>;
  token: string;
}

export interface UserResetPasswordDto {
  token: string;
  password: string;
}

export interface UserRequestPasswordResetDto {
  email: string;
} 