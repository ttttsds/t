import { 
  RegisterDto, 
  LoginDto, 
  VerifyAccountDto, 
  ResendVerificationDto,
  ForgotPasswordDto, 
  ResetPasswordDto, 
  AuthResponse 
} from './authInterface';

export interface IAuthService {
  register(data: RegisterDto): Promise<{ message: string }>;
  verifyAccount(data: VerifyAccountDto): Promise<{ message: string }>;
  resendVerification(data: ResendVerificationDto): Promise<{ message: string }>;
  login(data: LoginDto): Promise<AuthResponse>;
  forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }>;
  resetPassword(data: ResetPasswordDto): Promise<{ message: string }>;
  getCurrentUser(userId: string): Promise<Omit<any, 'password'>>;
}
