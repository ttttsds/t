import { UpdateProfileDto, ChangePasswordDto, UserProfile } from './userInterface';
import { IUserRepository } from '../../data/repositories/IUserRepository';

export interface IUserService {
  getUserProfile(userId: string): Promise<UserProfile>;
  updateUserProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile>;
  changePassword(userId: string, data: ChangePasswordDto): Promise<{ message: string }>;
}
