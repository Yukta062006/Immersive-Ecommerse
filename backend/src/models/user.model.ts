import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { addressSchema, IAddress } from "./shared/address.schema";

export interface IOAuthProvider {
  provider: string;
  providerId: string;
  linkedAt: Date;
}

export const OAUTH_NO_PASSWORD = "OAUTH_NO_PASSWORD";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: "customer" | "admin" | "superadmin";
  avatar?: string;
  phone?: string;
  wishlist: mongoose.Types.ObjectId[];
  addresses: IAddress[];
  oauthProviders: IOAuthProvider[];
  emailVerified: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked: boolean;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
      default: OAUTH_NO_PASSWORD,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "superadmin"],
      default: "customer",
    },
    avatar: { type: String },
    phone: { type: String, trim: true },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [addressSchema],
    oauthProviders: {
      type: [
        {
          provider: {
            type: String,
            required: true,
            maxlength: 50,
          },
          providerId: {
            type: String,
            required: true,
            maxlength: 255,
          },
          linkedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      validate: [
        {
          validator: function (val: any[]) {
            return val.length <= 5;
          },
          message: "Cannot link more than 5 OAuth providers",
        },
      ],
      default: [],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index(
  { "oauthProviders.provider": 1, "oauthProviders.providerId": 1 }
);

userSchema.virtual("isLocked").get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

userSchema.methods.incLoginAttempts = async function (this: IUser): Promise<void> {
  if (this.lockUntil && this.lockUntil > new Date()) {
    return;
  }
  this.loginAttempts += 1;
  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
  }
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function (this: IUser): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  if (this.passwordHash === OAUTH_NO_PASSWORD) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", userSchema);
