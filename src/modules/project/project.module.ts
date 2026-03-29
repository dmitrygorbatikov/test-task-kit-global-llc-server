// project.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectController } from './project.controller';
import ProjectService from './project.service';
import { Project, ProjectSchema } from './schemas/project.schema';
import {
  ProjectMember,
  ProjectMemberSchema,
} from './schemas/project-member.schema';
import {
  ProjectColumn,
  ProjectColumnSchema,
} from './schemas/project-column.schema';
import { ProjectTask, ProjectTaskSchema } from './schemas/project-task.schema';
import { UserModule } from '../user/user.module';
import {
  ProjectTaskComment,
  ProjectTaskCommentSchema,
} from './schemas/project-task-comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectMember.name, schema: ProjectMemberSchema },
      { name: ProjectColumn.name, schema: ProjectColumnSchema },
      { name: ProjectTask.name, schema: ProjectTaskSchema },
      { name: ProjectTaskComment.name, schema: ProjectTaskCommentSchema },
    ]),
    UserModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
