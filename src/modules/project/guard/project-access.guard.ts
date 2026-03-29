import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProjectMember,
  ProjectMemberDocument,
  ProjectRole,
} from '../schemas/project-member.schema';

const ROLE_PRIORITY = {
  [ProjectRole.VIEWER]: 0,
  [ProjectRole.MEMBER]: 1,
  [ProjectRole.ADMIN]: 2,
  [ProjectRole.OWNER]: 3,
};

export const PROJECT_ROLE_KEY = 'project_role';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(ProjectMember.name)
    private projectMemberModel: Model<ProjectMemberDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user?.userId as string | undefined;
    const projectId = request.params.projectId as string | undefined;

    const minRole = this.reflector.get<ProjectRole | undefined>(
      PROJECT_ROLE_KEY,
      context.getHandler(),
    );

    if (!userId || !projectId) {
      throw new ForbiddenException('Invalid context');
    }

    const member = await this.projectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    if (!member) {
      throw new ForbiddenException('Not a project member');
    }

    if (!minRole) {
      request.projectMember = member;
      return true;
    }

    if (ROLE_PRIORITY[member.role] < ROLE_PRIORITY[minRole]) {
      throw new ForbiddenException('Not enough permissions');
    }

    request.projectMember = member;

    return true;
  }
}
