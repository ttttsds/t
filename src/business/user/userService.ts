// src/modules/user/userService.ts
import ApiError from '../../shared/utils/ApiError';
import { IUserRepository } from '../../data/repositories/IUserRepository';
import { IHashService } from '../../shared/services/IHashService';
import { IUserService } from './IUserService';
import { UpdateProfileDto, ChangePasswordDto, UserProfile } from './userInterface';

export class UserService implements IUserService {
  private userRepository: IUserRepository;
  private hashService: IHashService;

  constructor(
    userRepository: IUserRepository,
    hashService: IHashService
  ) {
    this.userRepository = userRepository;
    this.hashService = hashService;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword as UserProfile;
  }
  
  async updateUserProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    const updatedUser = await this.userRepository.update(userId, data);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    return userWithoutPassword as UserProfile;
  }
  
  async changePassword(userId: string, data: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = data;
    
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await this.hashService.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await this.hashService.hash(newPassword);
    
    // Update password
    await this.userRepository.update(userId, {
      password: hashedPassword
    });
    
    return {
      message: 'Password updated successfully'
    };
  }
}