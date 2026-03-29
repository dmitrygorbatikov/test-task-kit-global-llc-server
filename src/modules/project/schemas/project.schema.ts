import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { ProjectMember } from './project-member.schema';

export type ProjectDocument = HydratedDocument<
  Project & {
    createdAt: Date;
    updatedAt: Date;
  }
>;

export enum DefaultColumns {
  BACKLOG = 'Backlog',
  TODO = 'To Do',
  INPROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Project {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  owner?: User;

  members?: ProjectMember[];

  constructor(partial?: Partial<Project>) {
    Object.assign(this, partial);
  }
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ deletedAt: 1 });
ProjectSchema.index(
  { ownerId: 1, title: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

ProjectSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

ProjectSchema.virtual('members', {
  ref: 'ProjectMember',
  localField: '_id',
  foreignField: 'projectId',
});

ProjectSchema.virtual('columns', {
  ref: 'ProjectColumn',
  localField: '_id',
  foreignField: 'projectId',
  justOne: false,
});
