import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CursorPaginationDto {
  @ApiPropertyOptional({
    example: 20,
    description: 'Maximum number of items to return',
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @ApiPropertyOptional({
    example: '12_65f1c2a8e4b0f5a1d8c55555',
    description: 'Cursor for the next page',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
