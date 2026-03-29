import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectColumnDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(25, { message: 'Title must be no more than 25 characters' })
  title?: string;
}
