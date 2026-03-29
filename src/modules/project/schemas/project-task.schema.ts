import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProjectColumn } from './project-column.schema';
import { User } from '../../user/schemas/user.schema';

export type ProjectTaskDocument = HydratedDocument<ProjectTask>;

export enum TaskStatus {
  ARCHIVED = 'archived',
  ACTIVE = 'active',
  DONE = 'done',
}

@Schema({ _id: false })
export class TaskLocation {
  @Prop({
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  })
  type: 'Point';

  @Prop({
    type: [Number],
    required: true,
  })
  coordinates: [number, number];
}

export const TaskLocationSchema = SchemaFactory.createForClass(TaskLocation);

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProjectTask {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'ProjectColumn' })
  columnId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: [],
  })
  assigneeIds: Types.ObjectId[];

  @Prop({ type: Date })
  deadline?: Date;

  @Prop({ default: 0 })
  order: number;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.ACTIVE,
  })
  status: TaskStatus;

  @Prop({ type: Types.ObjectId, ref: 'ProjectTask' })
  parentTaskId?: Types.ObjectId;

  @Prop({ type: TaskLocationSchema, required: false, default: null })
  location?: TaskLocation | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  assignees?: User[];
  column?: ProjectColumn;
  subTasks?: ProjectTask[];

  constructor(partial?: Partial<ProjectTask>) {
    Object.assign(this, partial);
  }
}

export const ProjectTaskSchema = SchemaFactory.createForClass(ProjectTask);

ProjectTaskSchema.index({ projectId: 1 });
ProjectTaskSchema.index({ columnId: 1, order: 1 });
ProjectTaskSchema.index({ projectId: 1, columnId: 1 });
ProjectTaskSchema.index({ assigneeIds: 1 });
ProjectTaskSchema.index({ location: '2dsphere' });

ProjectTaskSchema.virtual('assignees', {
  ref: 'User',
  localField: 'assigneeIds',
  foreignField: '_id',
  justOne: false,
});

ProjectTaskSchema.virtual('column', {
  ref: 'ProjectColumn',
  localField: 'columnId',
  foreignField: '_id',
  justOne: true,
});

ProjectTaskSchema.virtual('subTasks', {
  ref: 'ProjectTask',
  localField: '_id',
  foreignField: 'parentTaskId',
  justOne: false,
});
