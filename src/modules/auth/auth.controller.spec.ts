import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    loginUser: jest.fn(),
    registerUser: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should call authService.loginUser and return result', async () => {
      const dto = {
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
      };

      const serviceResult = {
        accessToken: 'mocked-jwt-token',
      };

      authServiceMock.loginUser.mockResolvedValue(serviceResult);

      const result = await controller.login(dto);

      expect(authServiceMock.loginUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('register', () => {
    it('should call authService.registerUser and return result', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'StrongP@ssw0rd',
      };

      const serviceResult = {
        accessToken: 'mocked-jwt-token',
      };

      authServiceMock.registerUser.mockResolvedValue(serviceResult);

      const result = await controller.register(dto);

      expect(authServiceMock.registerUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('logout', () => {
    it('should extract token from authorization header, call authService.logout and return success', async () => {
      const req = {
        headers: {
          authorization: 'Bearer jwt-token',
        },
      } as any;

      authServiceMock.logout.mockResolvedValue(undefined);

      const result = await controller.logout(req);

      expect(authServiceMock.logout).toHaveBeenCalledWith('jwt-token');
      expect(result).toEqual({
        success: true,
      });
    });

    it('should call authService.logout with undefined if authorization header is missing', async () => {
      const req = {
        headers: {},
      } as any;

      authServiceMock.logout.mockResolvedValue(undefined);

      const result = await controller.logout(req);

      expect(authServiceMock.logout).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        success: true,
      });
    });
  });
});
