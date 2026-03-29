import { ApiProperty } from '@nestjs/swagger';
import { ProjectTaskResponseDto } from './project-task-response.dto';
import { CursorMetaDto } from './cursor-meta.dto';

export class ColumnTasksResponseDto {
  @ApiProperty({ type: [ProjectTaskResponseDto] })
  data: ProjectTaskResponseDto[];

  @ApiProperty({ type: CursorMetaDto })
  meta: CursorMetaDto;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c22222' })
  columnId: string;
}
