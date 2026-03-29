import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import ProjectService from './project.service';
import { ProjectRole } from './schemas/project-member.schema';
import { Reflector } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { ProjectMember } from './schemas/project-member.schema';
import { AuthGuard } from '@nestjs/passport';

describe('ProjectController', () => {
  let controller: ProjectController;

  const projectServiceMock = {
    createProject: jest.fn(),
    updateProject: jest.fn(),
    getProjects: jest.fn(),
    getProjectBoard: jest.fn(),
    deleteProject: jest.fn(),
    addMembers: jest.fn(),
    getMembers: jest.fn(),
    removeMember: jest.fn(),
    searchUsersForAdd: jest.fn(),
    updateMemberRole: jest.fn(),
    addProjectColumn: jest.fn(),
    deleteProjectColumn: jest.fn(),
    updateProjectColumn: jest.fn(),
    createProjectTask: jest.fn(),
    getColumnTasks: jest.fn(),
    updateColumnTask: jest.fn(),
    updateColumnTaskStatus: jest.fn(),
    createTaskComment: jest.fn(),
    getTaskComments: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: projectServiceMock,
        },

        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAllAndOverride: jest.fn(),
          },
        },

        {
          provide: getModelToken(ProjectMember.name),
          useValue: {},
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(
        require('./decorators/project-access-guarded.decorator')
          .ProjectAccessGuard,
      )
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  describe('createProject', () => {
    it('should call projectService.createProject', async () => {
      const dto = { title: 'Test', description: 'Desc' };
      const user = { userId: 'user-1', email: 'test@test.com' };
      const serviceResult = { _id: 'project-1', title: 'Test' };

      projectServiceMock.createProject.mockResolvedValue(serviceResult);

      const result = await controller.createProject(dto as any, user as any);

      expect(projectServiceMock.createProject).toHaveBeenCalledWith(
        dto,
        user.userId,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('updateProject', () => {
    it('should call projectService.updateProject', async () => {
      const projectId = 'project-1';
      const dto = { title: 'Updated title', description: 'Updated desc' };
      const serviceResult = { _id: projectId, ...dto };

      projectServiceMock.updateProject.mockResolvedValue(serviceResult);

      const result = await controller.updateProject(projectId, dto as any);

      expect(projectServiceMock.updateProject).toHaveBeenCalledWith(
        projectId,
        dto,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('getProjects', () => {
    it('should call projectService.getProjects', async () => {
      const dto = { page: 1, perPage: 10 };
      const user = { userId: 'user-1' };
      const serviceResult = {
        data: [],
        meta: { page: 1, perPage: 10, total: 0, lastPage: 0 },
      };

      projectServiceMock.getProjects.mockResolvedValue(serviceResult);

      const result = await controller.getProjects(dto as any, user as any);

      expect(projectServiceMock.getProjects).toHaveBeenCalledWith(
        dto,
        user.userId,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('getProject', () => {
    it('should call projectService.getProjectBoard', async () => {
      const projectId = 'project-1';
      const user = { userId: 'user-1' };
      const serviceResult = {
        project: { _id: projectId, title: 'Project' },
        columns: [],
      };

      projectServiceMock.getProjectBoard.mockResolvedValue(serviceResult);

      const result = await controller.getProject(projectId, user as any);

      expect(projectServiceMock.getProjectBoard).toHaveBeenCalledWith(
        projectId,
        user.userId,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('deleteProject', () => {
    it('should call projectService.deleteProject', async () => {
      const projectId = 'project-1';
      const serviceResult = {
        success: true,
        message: 'Project deleted successfully',
      };

      projectServiceMock.deleteProject.mockResolvedValue(serviceResult);

      const result = await controller.deleteProject(projectId);

      expect(projectServiceMock.deleteProject).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('addMember', () => {
    it('should call projectService.addMembers', async () => {
      const projectId = 'project-1';
      const dto = {
        userIds: ['user-2', 'user-3'],
        role: ProjectRole.MEMBER,
      };
      const user = { userId: 'user-1' };
      const serviceResult = {
        message: 'Members added',
        data: [],
        meta: { addedCount: 2, skippedCount: 0 },
      };

      projectServiceMock.addMembers.mockResolvedValue(serviceResult);

      const result = await controller.addMember(
        projectId,
        dto as any,
        user as any,
      );

      expect(projectServiceMock.addMembers).toHaveBeenCalledWith(
        projectId,
        dto,
        user.userId,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('getMembers', () => {
    it('should call projectService.getMembers', async () => {
      const projectId = 'project-1';
      const filter = { page: 1, perPage: 10, search: 'john' };
      const serviceResult = {
        data: [],
        meta: { page: 1, perPage: 10, total: 0, totalPages: 0 },
      };

      projectServiceMock.getMembers.mockResolvedValue(serviceResult);

      const result = await controller.getMembers(projectId, filter as any);

      expect(projectServiceMock.getMembers).toHaveBeenCalledWith(
        projectId,
        filter,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('removeMember', () => {
    it('should call projectService.removeMember', async () => {
      const projectId = 'project-1';
      const memberId = 'user-2';
      const user = { userId: 'user-1' };
      const serviceResult = { message: 'Member removed successfully' };

      projectServiceMock.removeMember.mockResolvedValue(serviceResult);

      const result = await controller.removeMember(
        projectId,
        memberId,
        user as any,
      );

      expect(projectServiceMock.removeMember).toHaveBeenCalledWith(
        projectId,
        memberId,
        user.userId,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('searchUsersForAdd', () => {
    it('should call projectService.searchUsersForAdd', async () => {
      const projectId = 'project-1';
      const query = { search: 'john', page: 1, perPage: 10 };
      const serviceResult = {
        data: [],
        meta: { page: 1, perPage: 10, total: 0, totalPages: 0 },
      };

      projectServiceMock.searchUsersForAdd.mockResolvedValue(serviceResult);

      const result = await controller.searchUsersForAdd(
        projectId,
        query as any,
      );

      expect(projectServiceMock.searchUsersForAdd).toHaveBeenCalledWith(
        projectId,
        query,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('updateMemberRole', () => {
    it('should call projectService.updateMemberRole', async () => {
      const projectId = 'project-1';
      const memberId = 'user-2';
      const dto = { role: ProjectRole.ADMIN };
      const user = { userId: 'user-1' };
      const serviceResult = {
        message: 'Member role updated successfully',
        data: { userId: memberId, role: ProjectRole.ADMIN },
      };

      projectServiceMock.updateMemberRole.mockResolvedValue(serviceResult);

      const result = await controller.updateMemberRole(
        projectId,
        memberId,
        dto as any,
        user as any,
      );

      expect(projectServiceMock.updateMemberRole).toHaveBeenCalledWith(
        projectId,
        memberId,
        dto,
        user.userId,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('createProjectBoardColum', () => {
    it('should call projectService.addProjectColumn', async () => {
      const projectId = 'project-1';
      const dto = { title: 'New Column' };
      const serviceResult = { _id: 'column-1', title: 'New Column' };

      projectServiceMock.addProjectColumn.mockResolvedValue(serviceResult);

      const result = await controller.createProjectBoardColum(
        projectId,
        dto as any,
      );

      expect(projectServiceMock.addProjectColumn).toHaveBeenCalledWith(
        projectId,
        dto,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('deleteProjectBoardColum', () => {
    it('should call projectService.deleteProjectColumn', async () => {
      const projectId = 'project-1';
      const columnId = 'column-1';
      const serviceResult = { message: 'Column removed successfully' };

      projectServiceMock.deleteProjectColumn.mockResolvedValue(serviceResult);

      const result = await controller.deleteProjectBoardColum(
        projectId,
        columnId,
      );

      expect(projectServiceMock.deleteProjectColumn).toHaveBeenCalledWith(
        projectId,
        columnId,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('updateProjectColumn', () => {
    it('should call projectService.updateProjectColumn', async () => {
      const projectId = 'project-1';
      const columnId = 'column-1';
      const dto = { title: 'Updated Column' };
      const serviceResult = { _id: columnId, title: 'Updated Column' };

      projectServiceMock.updateProjectColumn.mockResolvedValue(serviceResult);

      const result = await controller.updateProjectColumn(
        projectId,
        columnId,
        dto as any,
      );

      expect(projectServiceMock.updateProjectColumn).toHaveBeenCalledWith(
        projectId,
        columnId,
        dto,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('createColumTask', () => {
    it('should call projectService.createProjectTask', async () => {
      const projectId = 'project-1';
      const columnId = 'column-1';
      const dto = { title: 'Task title' };
      const serviceResult = { _id: 'task-1', title: 'Task title' };

      projectServiceMock.createProjectTask.mockResolvedValue(serviceResult);

      const result = await controller.createColumTask(
        projectId,
        columnId,
        dto as any,
      );

      expect(projectServiceMock.createProjectTask).toHaveBeenCalledWith(
        projectId,
        columnId,
        dto,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('getColumTasks', () => {
    it('should call projectService.getColumnTasks', async () => {
      const projectId = 'project-1';
      const columnId = 'column-1';
      const query = { limit: 20, cursor: undefined };
      const serviceResult = {
        data: [],
        meta: { limit: 20, hasMore: false, nextCursor: null },
        columnId,
      };

      projectServiceMock.getColumnTasks.mockResolvedValue(serviceResult);

      const result = await controller.getColumTasks(
        projectId,
        columnId,
        query as any,
      );

      expect(projectServiceMock.getColumnTasks).toHaveBeenCalledWith(
        projectId,
        columnId,
        query,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('updateColumnTask', () => {
    it('should call projectService.updateColumnTask', async () => {
      const projectId = 'project-1';
      const columnId = 'column-1';
      const taskId = 'task-1';
      const dto = { title: 'Updated task' };
      const serviceResult = { _id: taskId, title: 'Updated task' };

      projectServiceMock.updateColumnTask.mockResolvedValue(serviceResult);

      const result = await controller.updateColumnTask(
        projectId,
        columnId,
        taskId,
        dto as any,
      );

      expect(projectServiceMock.updateColumnTask).toHaveBeenCalledWith(
        projectId,
        columnId,
        taskId,
        dto,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('updateColumnTaskStatus', () => {
    it('should call projectService.updateColumnTaskStatus', async () => {
      const projectId = 'project-1';
      const columnId = 'column-1';
      const taskId = 'task-1';
      const dto = { status: 'done' };
      const serviceResult = { _id: taskId, status: 'done' };

      projectServiceMock.updateColumnTaskStatus.mockResolvedValue(
        serviceResult,
      );

      const result = await controller.updateColumnTaskStatus(
        projectId,
        columnId,
        taskId,
        dto as any,
      );

      expect(projectServiceMock.updateColumnTaskStatus).toHaveBeenCalledWith(
        projectId,
        columnId,
        taskId,
        dto,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('createTaskComment', () => {
    it('should call projectService.createTaskComment', async () => {
      const projectId = 'project-1';
      const taskId = 'task-1';
      const dto = { content: 'Test comment' };
      const user = { userId: 'user-1' };
      const serviceResult = { _id: 'comment-1', content: 'Test comment' };

      projectServiceMock.createTaskComment.mockResolvedValue(serviceResult);

      const result = await controller.createTaskComment(
        projectId,
        taskId,
        dto as any,
        user as any,
      );

      expect(projectServiceMock.createTaskComment).toHaveBeenCalledWith(
        projectId,
        taskId,
        dto,
        user.userId,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('getTaskComments', () => {
    it('should call projectService.getTaskComments', async () => {
      const projectId = 'project-1';
      const taskId = 'task-1';
      const pagination = { page: 1, perPage: 20 };
      const user = { userId: 'user-1' };
      const serviceResult = {
        items: [],
        meta: { page: 1, perPage: 20, total: 0, totalPages: 0 },
      };

      projectServiceMock.getTaskComments.mockResolvedValue(serviceResult);

      const result = await controller.getTaskComments(
        projectId,
        taskId,
        pagination as any,
        user as any,
      );

      expect(projectServiceMock.getTaskComments).toHaveBeenCalledWith(
        projectId,
        taskId,
        pagination,
        user.userId,
      );
      expect(result).toEqual(serviceResult);
    });
  });
});
