import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserShortResponseDto } from './user-short-response.dto';
import { TaskLocationResponseDto } from './task-location-response.dto';

export class ProjectTaskResponseDto {
  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c55555' })
  _id: string;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c11111' })
  projectId: string;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c22222' })
  columnId: string;

  @ApiProperty({ example: 'Fix login bug' })
  title: string;

  @ApiPropertyOptional({
    example: 'Users cannot log in via Google OAuth',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: ['bug', 'frontend'],
    type: [String],
  })
  labels: string[];

  @ApiProperty({
    example: ['65f1c2a8e4b0f5a1d8c12345'],
    type: [String],
  })
  assigneeIds: string[];

  @ApiPropertyOptional({
    type: [UserShortResponseDto],
  })
  assignees?: UserShortResponseDto[];

  @ApiPropertyOptional({
    example: '2026-04-01T12:00:00.000Z',
    nullable: true,
  })
  deadline?: string | null;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({
    example: 'active',
    enum: ['archived', 'active', 'done'],
  })
  status: string;

  @ApiPropertyOptional({
    example: '65f1c2a8e4b0f5a1d8c99999',
    nullable: true,
  })
  parentTaskId?: string | null;

  @ApiPropertyOptional({
    type: TaskLocationResponseDto,
    nullable: true,
  })
  location?: TaskLocationResponseDto | null;

  @ApiProperty({ example: '2026-03-29T18:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-29T18:10:00.000Z' })
  updatedAt: string;
}
