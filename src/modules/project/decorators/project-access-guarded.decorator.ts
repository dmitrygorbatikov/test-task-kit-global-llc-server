import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  PROJECT_ROLE_KEY,
  ProjectAccessGuard,
} from '../guard/project-access.guard';
import { ProjectRole } from '../schemas/project-member.schema';

export function ProjectAccessGuarded(role?: ProjectRole) {
  return applyDecorators(
    SetMetadata(PROJECT_ROLE_KEY, role),
    UseGuards(ProjectAccessGuard),
  );
}
