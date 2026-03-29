import { IsEnum, IsMongoId, IsArray, ArrayNotEmpty } from 'class-validator';
import { ProjectRole } from '../schemas/project-member.schema';

export class AddProjectMemberDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true, message: 'Invalid user ID' })
  userIds: string[];

  @IsEnum(ProjectRole, { message: 'Invalid role' })
  role: ProjectRole = ProjectRole.MEMBER;
}
