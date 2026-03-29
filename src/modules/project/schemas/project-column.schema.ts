import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProjectTask } from './project-task.schema';
import { Project } from './project.schema';

export type ProjectColumnDocument = HydratedDocument<ProjectColumn>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProjectColumn {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  tasks?: ProjectTask[];
  project?: Project;

  constructor(partial?: Partial<ProjectColumn>) {
    Object.assign(this, partial);
  }
}

export const ProjectColumnSchema = SchemaFactory.createForClass(ProjectColumn);

ProjectColumnSchema.index({ projectId: 1, order: 1 });
ProjectColumnSchema.index({ projectId: 1 });
ProjectColumnSchema.index({ projectId: 1, isActive: 1 });
ProjectColumnSchema.index(
  { projectId: 1, title: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

ProjectColumnSchema.virtual('tasks', {
  ref: 'ProjectTask',
  localField: '_id',
  foreignField: 'columnId',
  justOne: false,
});
