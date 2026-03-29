import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginUserDto {
  @IsNotEmpty({ message: 'Email required' })
  @IsEmail({}, { message: 'Email incorrect format' })
  @Transform(({ value }) =>
    String(value || '')
      .toLowerCase()
      .trim(),
  )
  email: string;

  @IsNotEmpty({ message: 'Password required' })
  @IsString()
  password: string;
}
