import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async loginUser(data: LoginUserDto) {
    const { email, password } = data;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.comparePassword(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user._id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async registerUser(data: RegisterUserDto) {
    const { email, password } = data;

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        `User with this email=${email} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.userService.create({
      ...data,
      password: hashedPassword,
    });

    const payload = {
      userId: user._id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async logout(token: string) {
    await this.redis.set(`blacklist:${token}`, '1', 'EX', 60 * 60 * 24 * 7);
  }

  private async comparePassword(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}
