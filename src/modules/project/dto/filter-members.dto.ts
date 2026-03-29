import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectRole } from '../schemas/project-member.schema';
import { PaginationDto } from '../../../infrastracture/dto/pagination.dto';

export class FilterMembersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProjectRole)
  role?: ProjectRole;
}
