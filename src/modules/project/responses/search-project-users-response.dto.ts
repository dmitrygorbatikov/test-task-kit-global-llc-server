import { ApiProperty } from '@nestjs/swagger';
import { UserShortResponseDto } from './user-short-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class SearchProjectUsersResponseDto {
  @ApiProperty({ type: [UserShortResponseDto] })
  data: UserShortResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
