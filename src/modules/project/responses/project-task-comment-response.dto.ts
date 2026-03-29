import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserShortResponseDto } from './user-short-response.dto';

export class ProjectTaskCommentResponseDto {
  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c88888' })
  _id: string;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c11111' })
  projectId: string;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c55555' })
  taskId: string;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c12345' })
  authorId: string;

  @ApiProperty({ example: 'This task needs QA review first.' })
  content: string;

  @ApiPropertyOptional({
    example: '65f1c2a8e4b0f5a1d8c77777',
    nullable: true,
  })
  parentCommentId?: string | null;

  @ApiProperty({ type: UserShortResponseDto })
  author: UserShortResponseDto;

  @ApiProperty({ example: '2026-03-29T18:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-29T18:10:00.000Z' })
  updatedAt: string;

  @ApiPropertyOptional({
    type: () => [ProjectTaskCommentResponseDto],
  })
  replies?: ProjectTaskCommentResponseDto[];
}
