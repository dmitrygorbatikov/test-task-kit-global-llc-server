import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsMongoId,
  IsInt,
  Min,
  ValidateNested,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TaskLocationDto {
  @ApiPropertyOptional({
    example: 'Point',
    description: 'GeoJSON type',
    enum: ['Point'],
  })
  @IsString()
  @IsIn(['Point'])
  type: 'Point';

  @ApiPropertyOptional({
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

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Fix login bug',
    description: 'Task title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
    description: 'Task description (can be null)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: ['bug', 'backend'],
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
    description: 'Task deadline (can be null)',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  deadline?: string | null;

  @ApiPropertyOptional({
    example: '65f1c2a8e4b0f5a1d8c99999',
    description: 'Parent task ID (can be null)',
    nullable: true,
  })
  @IsOptional()
  @IsMongoId()
  parentTaskId?: string | null;

  @ApiPropertyOptional({
    example: '65f1c2a8e4b0f5a1d8c88888',
    description: 'Column ID (move task to another column)',
    nullable: true,
  })
  @IsOptional()
  @IsMongoId()
  columnId?: string | null;

  @ApiPropertyOptional({
    example: 0,
    description: 'Task order within column (can be null)',
    minimum: 0,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number | null;

  @ApiPropertyOptional({
    description: 'Task location (GeoJSON Point)',
    type: TaskLocationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskLocationDto)
  location?: TaskLocationDto;

  @ApiPropertyOptional({
    example: true,
    description: 'Remove existing location from task',
  })
  @IsOptional()
  @IsBoolean()
  removeLocation?: boolean;
}
