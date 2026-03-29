import { ApiProperty } from '@nestjs/swagger';

export class TaskLocationResponseDto {
  @ApiProperty({
    example: 'Point',
    enum: ['Point'],
  })
  type: 'Point';

  @ApiProperty({
    example: [30.5234, 50.4501],
    type: [Number],
  })
  coordinates: [number, number];
}
