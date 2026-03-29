import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../schemas/project-task.schema';

export class ChangeTaskStatusDto {
  @ApiProperty({
    example: TaskStatus.ACTIVE,
    description: 'New task status',
    enum: TaskStatus,
    required: true,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
