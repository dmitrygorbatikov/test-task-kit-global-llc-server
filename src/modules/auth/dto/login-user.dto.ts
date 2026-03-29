import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: true,
  })
  @IsNotEmpty({ message: 'Email required' })
  @IsEmail({}, { message: 'Email incorrect format' })
  @Transform(({ value }) =>
    String(value || '')
      .toLowerCase()
      .trim(),
  )
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'User password',
    required: true,
  })
  @IsNotEmpty({ message: 'Password required' })
  @IsString()
  password: string;
}
