import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProjectColumnDto {
  @ApiProperty({
    example: 'Backlog',
    description: 'Column title',
    minLength: 3,
    maxLength: 20,
    required: true,
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(20, { message: 'Title must be no more than 20 characters' })
  title: string;
}
