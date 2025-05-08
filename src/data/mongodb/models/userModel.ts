import * as mongoose from 'mongoose';
const { Schema } = mongoose;

export interface IUser extends mongoose.Document {
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

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null }
  },
  { timestamps: false, versionKey: false }
);

// Remove the pre-save hook that was causing typing issues
// or use a type assertion to fix it
userSchema.pre('save', function(this: any) {
  // Pre-save hook
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
