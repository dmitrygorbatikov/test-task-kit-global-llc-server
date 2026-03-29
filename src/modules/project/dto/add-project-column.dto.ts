import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AddProjectColumnDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(20, { message: 'Title must be no more than 20 characters' })
  title: string;
}
