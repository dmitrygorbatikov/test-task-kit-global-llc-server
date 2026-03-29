import { IsEnum, IsMongoId, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '../schemas/project-member.schema';

export class AddProjectMemberDto {
  @ApiProperty({
    example: ['65f1c2a8e4b0f5a1d8c12345', '65f1c2a8e4b0f5a1d8c67890'],
    description: 'List of user IDs to add to the project',
    type: [String],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true, message: 'Invalid user ID' })
  userIds: string[];

  @ApiProperty({
    example: ProjectRole.MEMBER,
    description: 'Role assigned to the users',
    enum: ProjectRole,
    required: true,
    default: ProjectRole.MEMBER,
  })
  @IsEnum(ProjectRole, { message: 'Invalid role' })
  role: ProjectRole = ProjectRole.MEMBER;
}
