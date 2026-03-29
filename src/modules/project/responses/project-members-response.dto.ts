import { ApiProperty } from '@nestjs/swagger';
import { ProjectMemberResponseDto } from './project-member-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class ProjectMembersResponseDto {
  @ApiProperty({ type: [ProjectMemberResponseDto] })
  data: ProjectMemberResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
