import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateNested,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  IsIn,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskLocationDto {
  @ApiProperty({
    example: 'Point',
    description: 'GeoJSON type',
    enum: ['Point'],
  })
  @IsString()
  @IsIn(['Point'])
  type: 'Point';

  @ApiProperty({
    example: [30.5234, 50.4501],
    description: 'Coordinates in [longitude, latitude] format',
    type: [Number],
    minItems: 2,
    maxItems: 2,
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

export class AddProjectTaskDto {
  @ApiProperty({
    example: 'Fix login bug',
    description: 'Task title',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Users cannot log in with Google',
    description: 'Task description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['bug', 'frontend'],
    description: 'Task labels',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @ApiPropertyOptional({
    example: ['65f1c2a8e4b0f5a1d8c12345'],
    description: 'Assigned user IDs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assigneeIds?: string[];

  @ApiPropertyOptional({
    example: '2026-04-01T12:00:00.000Z',
    description: 'Task deadline (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({
    example: '65f1c2a8e4b0f5a1d8c99999',
    description: 'Parent task ID (for subtasks)',
  })
  @IsOptional()
  @IsMongoId()
  parentTaskId?: string;

  @ApiPropertyOptional({
    description: 'Task location (GeoJSON Point)',
    type: TaskLocationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskLocationDto)
  location?: TaskLocationDto;
}
