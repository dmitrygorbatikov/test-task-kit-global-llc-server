import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from './user.service';
import { User } from './schemas/user.schema';

describe('UserService', () => {
  let service: UserService;

  const saveMock = jest.fn();
  const selectMock = jest.fn();
  const sortMock = jest.fn();
  const skipMock = jest.fn();
  const limitMock = jest.fn();
  const leanMock = jest.fn();
  const findOneMock = jest.fn();
  const findMock = jest.fn();
  const countDocumentsMock = jest.fn();

  const mockUserModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: saveMock,
  })) as any;

  mockUserModel.findOne = findOneMock;
  mockUserModel.find = findMock;
  mockUserModel.countDocuments = countDocumentsMock;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const dto = {
        fullName: 'Dmitry',
        email: 'test@test.com',
        password: '123456',
      };

      const savedUser = {
        _id: new Types.ObjectId(),
        ...dto,
      };

      saveMock.mockResolvedValue(savedUser);

      const result = await service.create(dto as any);

      expect(mockUserModel).toHaveBeenCalledWith(dto);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email and select password', async () => {
      const email = 'test@test.com';

      const expectedUser = {
        _id: new Types.ObjectId(),
        email,
        password: 'hashed-password',
      };

      selectMock.mockResolvedValue(expectedUser);
      findOneMock.mockReturnValue({
        select: selectMock,
      });

      const result = await service.findByEmail(email);

      expect(findOneMock).toHaveBeenCalledWith({ email });
      expect(selectMock).toHaveBeenCalledWith('+password');
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      const email = 'missing@test.com';

      selectMock.mockResolvedValue(null);
      findOneMock.mockReturnValue({
        select: selectMock,
      });

      const result = await service.findByEmail(email);

      expect(findOneMock).toHaveBeenCalledWith({ email });
      expect(selectMock).toHaveBeenCalledWith('+password');
      expect(result).toBeNull();
    });
  });

  describe('getUsersByMatch', () => {
    it('should return users list with correct query chain', async () => {
      const match = { deletedAt: null };
      const skip = 10;
      const perPage = 20;

      const users = [
        {
          _id: new Types.ObjectId(),
          fullName: 'User 1',
          email: 'user1@test.com',
          avatar: 'avatar1.png',
        },
      ];

      leanMock.mockResolvedValue(users);
      limitMock.mockReturnValue({ lean: leanMock });
      skipMock.mockReturnValue({ limit: limitMock });
      sortMock.mockReturnValue({ skip: skipMock });
      selectMock.mockReturnValue({ sort: sortMock });
      findMock.mockReturnValue({ select: selectMock });

      const result = await service.getUsersByMatch(match, skip, perPage);

      expect(findMock).toHaveBeenCalledWith(match);
      expect(selectMock).toHaveBeenCalledWith('_id fullName email avatar');
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skipMock).toHaveBeenCalledWith(skip);
      expect(limitMock).toHaveBeenCalledWith(perPage);
      expect(leanMock).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('getUsersCountByMatch', () => {
    it('should return users count by match', async () => {
      const match = { deletedAt: null };

      countDocumentsMock.mockResolvedValue(15);

      const result = await service.getUsersCountByMatch(match);

      expect(countDocumentsMock).toHaveBeenCalledWith(match);
      expect(result).toBe(15);
    });
  });

  describe('getExistingUsers', () => {
    it('should return existing users by ids with session', async () => {
      const userObjectIds = [new Types.ObjectId(), new Types.ObjectId()];
      const session = {} as any;

      const existingUsers = [
        { _id: userObjectIds[0] },
        { _id: userObjectIds[1] },
      ];

      findMock.mockResolvedValue(existingUsers);

      const result = await service.getExistingUsers(userObjectIds, session);

      expect(findMock).toHaveBeenCalledWith(
        {
          _id: { $in: userObjectIds },
          deletedAt: null,
        },
        { _id: 1 },
        { session },
      );

      expect(result).toEqual(existingUsers);
    });
  });
});
