import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { RegisterUserDto } from '../auth/dto/register-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private user: Model<UserDocument>,
  ) {}

  async create(data: RegisterUserDto): Promise<User> {
    const user = new this.user(data);

    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.user.findOne({ email }).select('+password');
  }

  async getUsersByMatch(match: any, skip: number, perPage: number) {
    return this.user
      .find(match)
      .select('_id fullName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();
  }

  async getUsersCountByMatch(match: any) {
    return this.user.countDocuments(match);
  }

  async getExistingUsers(
    userObjectIds: Types.ObjectId[],
    session: ClientSession,
  ) {
    return this.user.find(
      {
        _id: { $in: userObjectIds },
        deletedAt: null,
      },
      { _id: 1 },
      { session },
    );
  }

  async findById(id: string): Promise<User | null> {
    return this.user.findById(id);
  }

  async findAll(): Promise<User[]> {
    return this.user.find();
  }

  async delete(id: string) {
    return this.user.findByIdAndDelete(id);
  }
}
