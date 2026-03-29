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

export class TaskLocationDto {
  @IsString()
  @IsIn(['Point'])
  type: 'Point';

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assigneeIds?: string[];

  @IsOptional()
  @IsDateString()
  deadline?: string | null;

  @IsOptional()
  @IsMongoId()
  parentTaskId?: string | null;

  @IsOptional()
  @IsMongoId()
  columnId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => TaskLocationDto)
  location?: TaskLocationDto;

  @IsOptional()
  @IsBoolean()
  removeLocation?: boolean;
}
