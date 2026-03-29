import { ApiProperty } from '@nestjs/swagger';
import { ProjectTaskCommentResponseDto } from './project-task-comment-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class TaskCommentsResponseDto {
  @ApiProperty({ type: [ProjectTaskCommentResponseDto] })
  items: ProjectTaskCommentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
