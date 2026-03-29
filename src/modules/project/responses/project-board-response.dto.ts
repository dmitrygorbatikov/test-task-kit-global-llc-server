import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto';
import { ProjectColumnResponseDto } from './project-column-response.dto';

export class ProjectBoardResponseDto {
  @ApiProperty({ type: ProjectResponseDto })
  project: ProjectResponseDto;

  @ApiProperty({ type: [ProjectColumnResponseDto] })
  columns: ProjectColumnResponseDto[];
}
