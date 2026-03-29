import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectRole } from '../schemas/project-member.schema';
import { PaginationDto } from '../../../infrastracture/dto/pagination.dto';

export class FilterMembersDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'john',
    description: 'Search by user name or email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: ProjectRole.MEMBER,
    description: 'Filter by project role',
    enum: ProjectRole,
  })
  @IsOptional()
  @IsEnum(ProjectRole)
  role?: ProjectRole;
}
