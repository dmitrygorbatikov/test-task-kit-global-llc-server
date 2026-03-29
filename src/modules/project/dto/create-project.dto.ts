import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Task Management System',
    description: 'Project title',
    minLength: 3,
    maxLength: 25,
    required: true,
  })
  @IsNotEmpty({ message: 'Project title is required' })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(25, { message: 'Title must be no more than 25 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 'System for managing tasks and team collaboration',
    description: 'Project description',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Description must be at least 3 characters' })
  @MaxLength(50, { message: 'Description must no more than 50 characters' })
  description?: string;
}
