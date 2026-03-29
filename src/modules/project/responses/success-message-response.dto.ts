import { ApiProperty } from '@nestjs/swagger';

export class SuccessMessageResponseDto {
  @ApiProperty({ example: true })
  success?: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message?: string;
}
