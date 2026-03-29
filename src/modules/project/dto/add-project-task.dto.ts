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

export class AddProjectTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  deadline?: string;

  @IsOptional()
  @IsMongoId()
  parentTaskId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TaskLocationDto)
  location?: TaskLocationDto;
}
