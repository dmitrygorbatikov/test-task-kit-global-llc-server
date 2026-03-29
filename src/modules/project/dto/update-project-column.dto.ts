import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectColumnDto {
  @ApiPropertyOptional({
    example: 'In Progress',
    description: 'Column title',
    minLength: 3,
    maxLength: 25,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(25, { message: 'Title must be no more than 25 characters' })
  title?: string;
}
