// src/modules/auth/authService.ts
import crypto from 'crypto';
import ApiError from '../../shared/utils/ApiError';
import { IUserRepository } from '../../data/repositories/IUserRepository';
import { ITokenService } from '../../shared/services/ITokenService';
import { IEmailService } from '../../shared/services/IEmailService';
import { IHashService } from '../../shared/services/IHashService';
import { IAuthService } from './IAuthService';
import { 
  RegisterDto, 
  LoginDto, 
  VerifyAccountDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  AuthResponse,
  ResendVerificationDto
} from './authInterface';

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private tokenService: ITokenService;
  private emailService: IEmailService;
  private hashService: IHashService;

  constructor(
    userRepository: IUserRepository,
    tokenService: ITokenService,
    emailService: IEmailService,
    hashService: IHashService
  ) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.hashService = hashService;
  }

  async register(data: RegisterDto): Promise<{ message: string }> {
    const { firstName, lastName, email, password } = data;
    
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    
    if (existingUser) {
      throw ApiError.badRequest('Email already in use');
    }
    
    // Hash password
    const hashedPassword = await this.hashService.hash(password);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() +  1 * 60 * 60 * 1000); // 1 hours
    
    // Create user
    const user = await this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry
    });
    
    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
    
    return {
      message: 'User registered successfully. Please check your email to verify your account.'
    };
  }
  
  async verifyAccount(data: VerifyAccountDto): Promise<{ message: string }> {
    const { token } = data;
    
    // Find user with the token
    const user = await this.userRepository.findByVerificationToken(token);
    
    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }
    
    // Update user as verified
    await this.userRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    });
    
    return {
      message: 'Account verified successfully'
    };
  }
  
  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;
    
    // Find user
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      throw ApiError.unauthorized('Please verify your email before logging in');
    }
    
    // Check password
    const isPasswordValid = await this.hashService.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    
    // Generate JWT token
    const token = this.tokenService.generateToken({ id: user.id });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      token,
      user: userWithoutPassword as any
    };
  }
  
  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = data;
    
    // Find user
    const user = await this.userRepository.findByEmail(email);
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return {
        message: 'If an account with that email exists, we have sent a password reset link'
      };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    // Update user with reset token
    await this.userRepository.update(user.id, {
      resetToken,
      resetTokenExpiry
    });
    
    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    
    return {
      message: 'If an account with that email exists, we have sent a password reset link'
    };
  }
  
  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = data;
    
    // Find user with the token
    const user = await this.userRepository.findByResetToken(token);
    
    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }
    
    // Hash new password
    const hashedPassword = await this.hashService.hash(password);
    
    // Update user password
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });
    
    return {
      message: 'Password reset successfully'
    };
  }
  
  async getCurrentUser(userId: string): Promise<Omit<any, 'password'>> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  async resendVerification(data: ResendVerificationDto): Promise<{ message: string }> {
    const { email } = data;
    
    // Find user
    const user = await this.userRepository.findByEmail(email);
    
    // Don't reveal if user exists or not for security reasons
    if (!user) {
      return {
        message: 'If an account with that email exists, a verification link has been sent'
      };
    }
    
    // Check if the user is already verified
    if (user.isVerified) {
      // Still return the same message for security (avoid email enumeration)
      return {
        message: 'If an account with that email exists, a verification link has been sent'
      };
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() +  1 * 60 * 60 * 1000); // 1 hour
    
    // Update user with new verification token
    await this.userRepository.update(user.id, {
      verificationToken,
      verificationTokenExpiry
    });
    
    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
    
    return {
      message: 'If an account with that email exists, a verification link has been sent'
    };
  }
}