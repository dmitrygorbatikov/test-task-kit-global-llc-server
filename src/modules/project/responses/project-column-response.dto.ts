import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectColumnResponseDto {
  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c11111' })
  _id: string;

  @ApiProperty({ example: 'Backlog' })
  title: string;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '2026-03-29T18:00:00.000Z',
    nullable: true,
  })
  createdAt?: string;

  @ApiPropertyOptional({
    example: '2026-03-29T18:00:00.000Z',
    nullable: true,
  })
  updatedAt?: string;
}
