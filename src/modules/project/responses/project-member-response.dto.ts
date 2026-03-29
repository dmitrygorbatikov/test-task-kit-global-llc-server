import { ApiProperty } from '@nestjs/swagger';
import { UserShortResponseDto } from './user-short-response.dto';

export class ProjectMemberResponseDto {
  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c77777' })
  _id: string;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c11111' })
  projectId: string;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c12345' })
  userId: string;

  @ApiProperty({
    example: 'member',
    enum: ['owner', 'admin', 'member', 'viewer'],
  })
  role: string;

  @ApiProperty({ type: UserShortResponseDto })
  user: UserShortResponseDto;

  @ApiProperty({ example: '2026-03-29T18:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-29T18:10:00.000Z' })
  updatedAt: string;
}
