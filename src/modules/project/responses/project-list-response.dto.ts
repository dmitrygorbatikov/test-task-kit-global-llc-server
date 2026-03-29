import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto';
import { ProjectListMetaDto } from './project-list-meta.dto';

export class ProjectListResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  data: ProjectResponseDto[];

  @ApiProperty({ type: ProjectListMetaDto })
  meta: ProjectListMetaDto;
}
