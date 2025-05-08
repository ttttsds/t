import User from '../mongodb/models/userModel';
import type { IUser } from '../mongodb/models/userModel';
import { IUserRepository, User as UserType, UserCreateDto, UserUpdateDto } from './IUserRepository';

export class UserRepository implements IUserRepository {
  async findAll(): Promise<UserType[]> {
    const users = await User.find();
    return users.map((user: IUser) => this.mapToUser(user));
  }

  async findById(id: string): Promise<UserType | null> {
    const user = await User.findById(id);
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string): Promise<UserType | null> {
    const user = await User.findOne({ email });
    return user ? this.mapToUser(user) : null;
  }

  async findByVerificationToken(token: string): Promise<UserType | null> {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });
    return user ? this.mapToUser(user) : null;
  }

  async findByResetToken(token: string): Promise<UserType | null> {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });
    return user ? this.mapToUser(user) : null;
  }

  async create(data: UserCreateDto): Promise<UserType> {
    const user = await User.create(data);
    return this.mapToUser(user);
  }

  async update(id: string, data: UserUpdateDto): Promise<UserType> {
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return this.mapToUser(user);
  }

  async delete(id: string): Promise<UserType> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return this.mapToUser(user);
  }

  async userExists(id: string): Promise<boolean> {
    try {
      const count = await User.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  private mapToUser(doc: any): UserType {
    return {
      id: doc._id.toString(),
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      password: doc.password,
      isVerified: doc.isVerified,
      verificationToken: doc.verificationToken,
      verificationTokenExpiry: doc.verificationTokenExpiry,
      resetToken: doc.resetToken,
      resetTokenExpiry: doc.resetTokenExpiry
    };
  }
}

