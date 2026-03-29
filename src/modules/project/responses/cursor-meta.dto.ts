import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CursorMetaDto {
  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: true })
  hasMore: boolean;

  @ApiPropertyOptional({
    example: '12_65f1c2a8e4b0f5a1d8c55555',
    nullable: true,
  })
  nextCursor?: string | null;
}
