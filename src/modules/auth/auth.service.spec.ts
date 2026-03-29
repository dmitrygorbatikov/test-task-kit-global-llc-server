import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RedisService } from '../redis/redis.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const userServiceMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const jwtServiceMock = {
    sign: jest.fn(),
  };

  const redisServiceMock = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('loginUser', () => {
    it('should return access token for valid credentials', async () => {
      const dto = {
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
      };

      const user = {
        _id: 'user-id-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashed-password',
      };

      userServiceMock.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.sign.mockReturnValue('mocked-jwt-token');

      const result = await service.loginUser(dto);

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        userId: user._id,
        email: user.email,
      });
      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto = {
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
      };

      userServiceMock.findByEmail.mockResolvedValue(null);

      await expect(service.loginUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.loginUser(dto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const dto = {
        email: 'john.doe@example.com',
        password: 'WrongP@ssw0rd',
      };

      const user = {
        _id: 'user-id-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashed-password',
      };

      userServiceMock.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.loginUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.loginUser(dto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });
  });

  describe('registerUser', () => {
    it('should create user with hashed password and return access token', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
      };

      const createdUser = {
        _id: 'user-id-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashed-password',
      };

      userServiceMock.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      userServiceMock.create.mockResolvedValue(createdUser);
      jwtServiceMock.sign.mockReturnValue('mocked-jwt-token');

      const result = await service.registerUser(dto);

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(userServiceMock.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed-password',
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        userId: createdUser._id,
        email: createdUser.email,
      });
      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
      };

      userServiceMock.findByEmail.mockResolvedValue({
        _id: 'existing-user-id',
        email: dto.email,
      });

      await expect(service.registerUser(dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.registerUser(dto)).rejects.toThrow(
        `User with this email=${dto.email} already exists`,
      );

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userServiceMock.create).not.toHaveBeenCalled();
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should store token in redis blacklist', async () => {
      const token = 'jwt-token';

      redisServiceMock.set.mockResolvedValue(undefined);

      await service.logout(token);

      expect(redisServiceMock.set).toHaveBeenCalledWith(
        `blacklist:${token}`,
        '1',
        'EX',
        60 * 60 * 24 * 7,
      );
    });
  });
});
