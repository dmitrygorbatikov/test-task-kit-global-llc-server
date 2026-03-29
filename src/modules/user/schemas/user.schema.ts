import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProjectColumnSchema } from '../../project/schemas/project-column.schema';

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, index: true })
  fullName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date | null;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('validate', function () {
  this.fullName = `${this.firstName} ${this.lastName}`;
});
