import { IsEnum } from 'class-validator';
import { ProjectRole } from '../schemas/project-member.schema';

export class UpdateProjectMemberRoleDto {
  @IsEnum(ProjectRole)
  role: ProjectRole;
}
