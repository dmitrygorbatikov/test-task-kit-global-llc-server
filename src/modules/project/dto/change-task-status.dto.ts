import { IsEnum } from 'class-validator';
import { TaskStatus } from '../schemas/project-task.schema';

export class ChangeTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
