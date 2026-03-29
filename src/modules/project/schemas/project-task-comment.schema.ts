import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { ProjectTask } from './project-task.schema';

export type ProjectTaskCommentDocument = HydratedDocument<ProjectTaskComment>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'projecttaskcomments',
})
export class ProjectTaskComment {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'ProjectTask' })
  taskId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  authorId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'ProjectTaskComment', default: null })
  parentCommentId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  author?: User;
  task?: ProjectTask;
  replies?: ProjectTaskComment[];

  constructor(partial?: Partial<ProjectTaskComment>) {
    Object.assign(this, partial);
  }
}

export const ProjectTaskCommentSchema =
  SchemaFactory.createForClass(ProjectTaskComment);

ProjectTaskCommentSchema.index({ taskId: 1, createdAt: -1 });
ProjectTaskCommentSchema.index({ projectId: 1, taskId: 1 });
ProjectTaskCommentSchema.index({ parentCommentId: 1 });
ProjectTaskCommentSchema.index({ authorId: 1 });

ProjectTaskCommentSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

ProjectTaskCommentSchema.virtual('task', {
  ref: 'ProjectTask',
  localField: 'taskId',
  foreignField: '_id',
  justOne: true,
});

ProjectTaskCommentSchema.virtual('replies', {
  ref: 'ProjectTaskComment',
  localField: '_id',
  foreignField: 'parentCommentId',
  justOne: false,
});
