import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { RegisterDto, LoginDto, IUser } from '../types';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';

interface TokenPayload {
  id: string;
  email: string;
  plan: string;
}

export class AuthService {
  static generateToken(user: IUser): string {
    return jwt.sign(
      { id: user._id.toString(), email: user.email, plan: user.plan },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  static async register(dto: RegisterDto): Promise<{ user: IUser; token: string }> {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictError('An account with this email already exists');

    if (dto.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const user = await User.create({
      email: dto.email.toLowerCase(),
      password: dto.password,
      name: dto.name,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login(dto: LoginDto): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select('+password');
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const isValid = await user.comparePassword(dto.password);
    if (!isValid) throw new UnauthorizedError('Invalid email or password');

    const token = this.generateToken(user);
    return { user, token };
  }
}
