import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c12345' })
  _id: string;

  @ApiProperty({ example: 'Task Management System' })
  title: string;

  @ApiPropertyOptional({
    example: 'System for managing tasks and teamwork',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c99999' })
  ownerId: string;

  @ApiProperty({
    example: 'owner',
    enum: ['owner', 'admin', 'member', 'viewer'],
  })
  role: string;

  @ApiProperty({ example: '2026-03-29T18:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-29T18:10:00.000Z' })
  updatedAt: string;
}
