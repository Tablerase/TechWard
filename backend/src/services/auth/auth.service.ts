import jwt, { SignOptions } from "jsonwebtoken";
import { funnyCaregiverNameGenerator } from "@utils/funnyCaregiverNames";
import { User, UserTokenPayload } from "@entity/user";

// In-memory user store (replace with database in production)
const users = new Map<string, User>();
const refreshTokenStore = new Map<string, string>(); // refreshToken -> userId

export class AuthService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-default-secret-change-me";
  private static readonly ACCESS_TOKEN_EXPIRY = (process.env
    .JWT_ACCESS_EXPIRY || "15m") as string;
  private static readonly REFRESH_TOKEN_EXPIRY = (process.env
    .JWT_REFRESH_EXPIRY || "7d") as string;

  /**
   * Generate a unique user ID using timestamp and random string
   */
  private static generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return `${timestamp}-${randomStr}`;
  }

  /**
   * Create a new user with a funny caregiver name
   */
  static createUser(): User {
    const { firstName, lastName } = funnyCaregiverNameGenerator();
    const userId = this.generateUserId();

    const user: User = {
      id: userId,
      firstName,
      lastName,
      createdAt: new Date(),
    };

    users.set(userId, user);
    return user;
  }

  /**
   * Get user by ID
   */
  static getUserById(userId: string): User | undefined {
    return users.get(userId);
  }

  /**
   * Generate access token (short-lived, stored in localStorage)
   */
  static generateAccessToken(user: User): string {
    const payload: UserTokenPayload = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const options = {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    } as SignOptions;

    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Generate refresh token (long-lived, stored in httpOnly cookie)
   */
  static generateRefreshToken(user: User): string {
    const payload: UserTokenPayload = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const options = {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    } as SignOptions;

    const refreshToken = jwt.sign(payload, this.JWT_SECRET, options);

    // Store refresh token
    refreshTokenStore.set(refreshToken, user.id);

    // Update user's refresh token
    const storedUser = users.get(user.id);
    if (storedUser) {
      storedUser.refreshToken = refreshToken;
    }

    return refreshToken;
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): UserTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as UserTokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify and decode refresh token
   */
  static verifyRefreshToken(token: string): UserTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as UserTokenPayload;

      // Verify token exists in our store
      const userId = refreshTokenStore.get(token);
      if (!userId || userId !== decoded.userId) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Invalidate refresh token (for logout)
   */
  static invalidateRefreshToken(token: string): void {
    const userId = refreshTokenStore.get(token);
    refreshTokenStore.delete(token);

    // Clear user's refresh token
    if (userId) {
      const user = users.get(userId);
      if (user) {
        delete user.refreshToken;
      }
    }
  }

  /**
   * Get or create user - automatic user creation if doesn't exist
   */
  static getOrCreateUser(userId?: string): User {
    if (userId) {
      const existingUser = this.getUserById(userId);
      if (existingUser) {
        return existingUser;
      }
    }

    // User doesn't exist, create a new one
    return this.createUser();
  }

  /**
   * Generate both tokens for a user
   */
  static generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }
}
