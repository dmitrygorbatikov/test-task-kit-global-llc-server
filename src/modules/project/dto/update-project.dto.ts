import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(25, { message: 'Title must be no more than 25 characters' })
  title?: string;
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Description must be at least 3 characters' })
  @MaxLength(50, { message: 'Description must no more than 50 characters' })
  description?: string;
}
