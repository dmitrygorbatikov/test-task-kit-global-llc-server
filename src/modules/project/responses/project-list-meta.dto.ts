import { ApiProperty } from '@nestjs/swagger';

export class ProjectListMetaDto {
  @ApiProperty({ example: 24 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  perPage: number;

  @ApiProperty({ example: 3 })
  lastPage: number;
}
