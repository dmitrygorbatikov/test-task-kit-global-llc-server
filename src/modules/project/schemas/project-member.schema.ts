import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Project } from './project.schema';

export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export type ProjectMemberDocument = HydratedDocument<ProjectMember>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProjectMember {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(ProjectRole),
    default: ProjectRole.MEMBER,
  })
  role: ProjectRole;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  user?: User;

  project?: Project;

  constructor(partial?: Partial<ProjectMember>) {
    Object.assign(this, partial);
  }
}

export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember);

ProjectMemberSchema.index(
  { projectId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);
ProjectMemberSchema.index({ projectId: 1 });
ProjectMemberSchema.index({ userId: 1 });

ProjectMemberSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});
