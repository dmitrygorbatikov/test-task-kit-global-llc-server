import {
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectTaskCommentDto {
  @ApiProperty({
    example: 'This task needs to be reviewed before deployment.',
    description: 'Comment content',
    minLength: 1,
    maxLength: 5000,
    required: true,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({
    example: '65f1c2a8e4b0f5a1d8c77777',
    description: 'Parent comment ID (for replies)',
  })
  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;
}
