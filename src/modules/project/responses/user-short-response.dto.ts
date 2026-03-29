import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserShortResponseDto {
  @ApiProperty({ example: '65f1c2a8e4b0f5a1d8c12345' })
  _id: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatar.jpg',
    nullable: true,
  })
  avatar?: string | null;
}
