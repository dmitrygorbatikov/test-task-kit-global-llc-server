import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '../schemas/project-member.schema';

export class UpdateProjectMemberRoleDto {
  @ApiProperty({
    example: ProjectRole.ADMIN,
    description: 'New role for the project member',
    enum: ProjectRole,
    required: true,
  })
  @IsEnum(ProjectRole)
  role: ProjectRole;
}
