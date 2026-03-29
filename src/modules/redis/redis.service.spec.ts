import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

jest.mock('ioredis');

describe('RedisService', () => {
  let service: RedisService;
  let configService: jest.Mocked<ConfigService>;

  const redisMock = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (Redis as unknown as jest.Mock).mockImplementation(() => redisMock);

    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
  });

  describe('constructor', () => {
    it('should create Redis client with values from ConfigService', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'REDIS_HOST') return '127.0.0.1';
        if (key === 'REDIS_PORT') return 6380;
        return undefined;
      });

      service = new RedisService(configService);

      expect(Redis).toHaveBeenCalledWith({
        host: '127.0.0.1',
        port: 6380,
      });
    });

    it('should use default values if config values are missing', () => {
      configService.get.mockReturnValue(undefined);

      service = new RedisService(configService);

      expect(Redis).toHaveBeenCalledWith({
        host: 'localhost',
        port: 6379,
      });
    });
  });

  describe('set', () => {
    beforeEach(() => {
      configService.get.mockReturnValue(undefined);
      service = new RedisService(configService);
    });

    it('should call redis set with EX when ttlSeconds is provided', async () => {
      redisMock.set.mockResolvedValue('OK');

      await service.set('test:key', 'test-value', 'unused', 60);

      expect(redisMock.set).toHaveBeenCalledWith(
        'test:key',
        'test-value',
        'EX',
        60,
      );
    });

    it('should call redis set without EX when ttlSeconds is not provided', async () => {
      redisMock.set.mockResolvedValue('OK');

      await service.set('test:key', 'test-value', 'unused');

      expect(redisMock.set).toHaveBeenCalledWith('test:key', 'test-value');
    });
  });

  describe('get', () => {
    beforeEach(() => {
      configService.get.mockReturnValue(undefined);
      service = new RedisService(configService);
    });

    it('should return value from redis get', async () => {
      redisMock.get.mockResolvedValue('stored-value');

      const result = await service.get('test:key');

      expect(redisMock.get).toHaveBeenCalledWith('test:key');
      expect(result).toBe('stored-value');
    });
  });

  describe('del', () => {
    beforeEach(() => {
      configService.get.mockReturnValue(undefined);
      service = new RedisService(configService);
    });

    it('should call redis del and return result', async () => {
      redisMock.del.mockResolvedValue(1);

      const result = await service.del('test:key');

      expect(redisMock.del).toHaveBeenCalledWith('test:key');
      expect(result).toBe(1);
    });
  });

  describe('onModuleDestroy', () => {
    beforeEach(() => {
      configService.get.mockReturnValue(undefined);
      service = new RedisService(configService);
    });

    it('should call redis quit', async () => {
      redisMock.quit.mockResolvedValue('OK');

      await service.onModuleDestroy();

      expect(redisMock.quit).toHaveBeenCalled();
    });
  });
});
