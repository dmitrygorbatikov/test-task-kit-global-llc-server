import { ApiProperty } from '@nestjs/swagger';
import { ProjectMemberResponseDto } from './project-member-response.dto';

export class AddMembersMetaDto {
  @ApiProperty({ example: 2 })
  addedCount: number;

  @ApiProperty({ example: 1 })
  skippedCount: number;
}

export class AddMembersResponseDto {
  @ApiProperty({ example: 'Members added' })
  message: string;

  @ApiProperty({ type: [ProjectMemberResponseDto] })
  data: ProjectMemberResponseDto[];

  @ApiProperty({ type: AddMembersMetaDto })
  meta: AddMembersMetaDto;
}
