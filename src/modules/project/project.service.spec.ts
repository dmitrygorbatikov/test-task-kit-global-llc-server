import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import ProjectService from './project.service';
import { Project, DefaultColumns } from './schemas/project.schema';
import { ProjectMember, ProjectRole } from './schemas/project-member.schema';
import { ProjectColumn } from './schemas/project-column.schema';
import { ProjectTask } from './schemas/project-task.schema';
import { ProjectTaskComment } from './schemas/project-task-comment.schema';
import { UserService } from '../user/user.service';

describe('ProjectService', () => {
  let service: ProjectService;

  const sessionMock = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const projectModelMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    findById: jest.fn(),
    aggregate: jest.fn(),
    db: {
      startSession: jest.fn().mockResolvedValue(sessionMock),
    },
  };

  const projectMemberModelMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    insertMany: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    aggregate: jest.fn(),
  };

  const projectColumnModelMock = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    insertMany: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    exists: jest.fn(),
    db: {
      startSession: jest.fn().mockResolvedValue(sessionMock),
    },
  };

  const projectTaskModelMock = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    aggregate: jest.fn(),
    db: {
      startSession: jest.fn().mockResolvedValue(sessionMock),
    },
  };

  const projectTaskCommentModelMock = {
    updateMany: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  };

  const userServiceMock = {
    getExistingUsers: jest.fn(),
    getUsersByMatch: jest.fn(),
    getUsersCountByMatch: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    sessionMock.startTransaction.mockClear();
    sessionMock.commitTransaction.mockClear();
    sessionMock.abortTransaction.mockClear();
    sessionMock.endSession.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getModelToken(Project.name),
          useValue: projectModelMock,
        },
        {
          provide: getModelToken(ProjectMember.name),
          useValue: projectMemberModelMock,
        },
        {
          provide: getModelToken(ProjectColumn.name),
          useValue: projectColumnModelMock,
        },
        {
          provide: getModelToken(ProjectTask.name),
          useValue: projectTaskModelMock,
        },
        {
          provide: getModelToken(ProjectTaskComment.name),
          useValue: projectTaskCommentModelMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  describe('createProject', () => {
    it('should create project, owner membership and default columns', async () => {
      const dto = {
        title: 'Test Project',
        description: 'Description',
      };

      const userId = new Types.ObjectId().toString();
      const newProjectId = new Types.ObjectId();

      projectModelMock.findOne.mockResolvedValue(null);
      projectModelMock.create.mockResolvedValue([
        {
          _id: newProjectId,
          title: dto.title,
          description: dto.description,
          ownerId: new Types.ObjectId(userId),
        },
      ]);
      projectMemberModelMock.create.mockResolvedValue([]);
      projectColumnModelMock.insertMany.mockResolvedValue([]);

      const populatedProject = {
        _id: newProjectId,
        title: dto.title,
      };

      const execMock = jest.fn().mockResolvedValue(populatedProject);
      const populateMembersMock = jest.fn().mockReturnValue({ exec: execMock });
      const populateOwnerMock = jest
        .fn()
        .mockReturnValue({ populate: populateMembersMock });

      projectModelMock.findById.mockReturnValue({
        populate: populateOwnerMock,
      });

      const result = await service.createProject(dto as any, userId);

      expect(projectModelMock.findOne).toHaveBeenCalledTimes(1);
      const findOneArg = projectModelMock.findOne.mock.calls[0][0];
      expect(findOneArg.title).toBe(dto.title);
      expect(findOneArg.ownerId).toBeInstanceOf(Types.ObjectId);
      expect(findOneArg.ownerId.toString()).toBe(userId);

      expect(sessionMock.startTransaction).toHaveBeenCalled();

      expect(projectModelMock.create).toHaveBeenCalledTimes(1);
      const projectCreateDocs = projectModelMock.create.mock.calls[0][0];
      const projectCreateOptions = projectModelMock.create.mock.calls[0][1];

      expect(projectCreateDocs).toHaveLength(1);
      expect(projectCreateDocs[0].title).toBe(dto.title);
      expect(projectCreateDocs[0].description).toBe(dto.description);
      expect(projectCreateDocs[0].ownerId).toBeInstanceOf(Types.ObjectId);
      expect(projectCreateDocs[0].ownerId.toString()).toBe(userId);
      expect(projectCreateOptions).toEqual({ session: sessionMock });

      expect(projectMemberModelMock.create).toHaveBeenCalledTimes(1);
      const memberCreateDocs = projectMemberModelMock.create.mock.calls[0][0];
      const memberCreateOptions =
        projectMemberModelMock.create.mock.calls[0][1];

      expect(memberCreateDocs).toHaveLength(1);
      expect(memberCreateDocs[0].projectId.toString()).toBe(
        newProjectId.toString(),
      );
      expect(memberCreateDocs[0].userId).toBeInstanceOf(Types.ObjectId);
      expect(memberCreateDocs[0].userId.toString()).toBe(userId);
      expect(memberCreateDocs[0].role).toBe(ProjectRole.OWNER);
      expect(memberCreateOptions).toEqual({ session: sessionMock });

      expect(projectColumnModelMock.insertMany).toHaveBeenCalledWith(
        [
          { projectId: newProjectId, title: DefaultColumns.BACKLOG, order: 0 },
          { projectId: newProjectId, title: DefaultColumns.TODO, order: 1 },
          {
            projectId: newProjectId,
            title: DefaultColumns.INPROGRESS,
            order: 2,
          },
          { projectId: newProjectId, title: DefaultColumns.REVIEW, order: 3 },
          { projectId: newProjectId, title: DefaultColumns.DONE, order: 4 },
        ],
        { session: sessionMock },
      );

      expect(projectModelMock.findById).toHaveBeenCalledTimes(1);
      const findByIdArg = projectModelMock.findById.mock.calls[0][0];
      expect(findByIdArg.toString()).toBe(newProjectId.toString());

      expect(sessionMock.commitTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect(result).toEqual(populatedProject);
    });

    it('should throw ConflictException if project already exists', async () => {
      const dto = {
        title: 'Test Project',
        description: 'Description',
      };

      projectModelMock.findOne.mockResolvedValue({
        _id: new Types.ObjectId(),
      });

      await expect(
        service.createProject(dto as any, new Types.ObjectId().toString()),
      ).rejects.toThrow(ConflictException);

      expect(projectModelMock.create).not.toHaveBeenCalled();
      expect(projectMemberModelMock.create).not.toHaveBeenCalled();
      expect(projectColumnModelMock.insertMany).not.toHaveBeenCalled();
    });

    it('should abort transaction if create fails', async () => {
      const dto = {
        title: 'Test Project',
        description: 'Description',
      };

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      projectModelMock.findOne.mockResolvedValue(null);
      projectModelMock.create.mockRejectedValue(new Error('db error'));

      await expect(
        service.createProject(dto as any, new Types.ObjectId().toString()),
      ).rejects.toThrow('db error');

      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteProject', () => {
    it('should soft delete project and related entities', async () => {
      const projectId = new Types.ObjectId().toString();

      projectModelMock.findOne.mockResolvedValue({
        _id: new Types.ObjectId(projectId),
      });
      projectModelMock.updateOne.mockResolvedValue({ modifiedCount: 1 });
      projectColumnModelMock.updateMany.mockResolvedValue({ modifiedCount: 2 });
      projectTaskModelMock.updateMany.mockResolvedValue({ modifiedCount: 3 });
      projectTaskCommentModelMock.updateMany.mockResolvedValue({
        modifiedCount: 4,
      });
      projectMemberModelMock.updateMany.mockResolvedValue({ modifiedCount: 5 });

      const result = await service.deleteProject(projectId);

      expect(sessionMock.startTransaction).toHaveBeenCalled();
      expect(projectModelMock.findOne).toHaveBeenCalled();
      expect(projectModelMock.updateOne).toHaveBeenCalled();
      expect(projectColumnModelMock.updateMany).toHaveBeenCalled();
      expect(projectTaskModelMock.updateMany).toHaveBeenCalled();
      expect(projectTaskCommentModelMock.updateMany).toHaveBeenCalled();
      expect(projectMemberModelMock.updateMany).toHaveBeenCalled();
      expect(sessionMock.commitTransaction).toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        message: 'Project deleted successfully',
      });
    });

    it('should throw BadRequestException for invalid project id', async () => {
      await expect(service.deleteProject('bad-id')).rejects.toThrow(
        new BadRequestException('Invalid project id'),
      );

      expect(projectModelMock.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if project not found', async () => {
      const projectId = new Types.ObjectId().toString();

      projectModelMock.findOne.mockResolvedValue(null);

      await expect(service.deleteProject(projectId)).rejects.toThrow(
        new NotFoundException('Project not found'),
      );

      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
    });
  });

  describe('deleteProjectColumn', () => {
    it('should move tasks to backlog and soft delete column', async () => {
      const projectId = new Types.ObjectId().toString();
      const columnId = new Types.ObjectId().toString();
      const backlogId = new Types.ObjectId();

      projectModelMock.findOne.mockResolvedValueOnce({
        _id: new Types.ObjectId(projectId),
      });

      projectColumnModelMock.findOne
        .mockResolvedValueOnce({
          _id: new Types.ObjectId(columnId),
          projectId: new Types.ObjectId(projectId),
          equals(this: { _id: Types.ObjectId }, id: Types.ObjectId) {
            return this._id.equals(id);
          },
        })
        .mockResolvedValueOnce({
          _id: backlogId,
          title: DefaultColumns.BACKLOG,
        });

      projectTaskModelMock.updateMany.mockResolvedValue({ modifiedCount: 2 });
      projectColumnModelMock.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.deleteProjectColumn(projectId, columnId);

      expect(projectTaskModelMock.updateMany).toHaveBeenCalledWith(
        {
          projectId: expect.any(Types.ObjectId),
          columnId: expect.any(Types.ObjectId),
          deletedAt: null,
        },
        {
          $set: {
            columnId: backlogId,
          },
        },
        { session: sessionMock },
      );

      expect(projectColumnModelMock.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Types.ObjectId) },
        { $set: { deletedAt: expect.any(Date) } },
        { session: sessionMock },
      );

      expect(sessionMock.commitTransaction).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Column removed successfully',
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      projectModelMock.findOne.mockResolvedValue(null);

      await expect(
        service.deleteProjectColumn(
          new Types.ObjectId().toString(),
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(new NotFoundException('Project not found'));
    });

    it('should throw NotFoundException if column not found', async () => {
      projectModelMock.findOne.mockResolvedValue({
        _id: new Types.ObjectId(),
      });

      projectColumnModelMock.findOne.mockResolvedValueOnce(null);

      await expect(
        service.deleteProjectColumn(
          new Types.ObjectId().toString(),
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(new NotFoundException('Column not found'));
    });

    it('should throw NotFoundException if backlog column not found', async () => {
      projectModelMock.findOne.mockResolvedValue({
        _id: new Types.ObjectId(),
      });

      projectColumnModelMock.findOne
        .mockResolvedValueOnce({
          _id: new Types.ObjectId(),
          equals(this: { _id: Types.ObjectId }, id: Types.ObjectId) {
            return this._id.equals(id);
          },
        })
        .mockResolvedValueOnce(null);

      await expect(
        service.deleteProjectColumn(
          new Types.ObjectId().toString(),
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(new NotFoundException('Backlog column not found'));
    });

    it('should throw BadRequestException if trying to delete backlog column', async () => {
      const sameId = new Types.ObjectId();

      projectModelMock.findOne.mockResolvedValue({
        _id: new Types.ObjectId(),
      });

      projectColumnModelMock.findOne
        .mockResolvedValueOnce({
          _id: sameId,
          projectId: new Types.ObjectId(),
          equals(this: { _id: Types.ObjectId }, id: Types.ObjectId) {
            return this._id.equals(id);
          },
        })
        .mockResolvedValueOnce({
          _id: sameId,
          title: DefaultColumns.BACKLOG,
        });

      await expect(
        service.deleteProjectColumn(
          new Types.ObjectId().toString(),
          sameId.toString(),
        ),
      ).rejects.toThrow(
        new BadRequestException('Backlog column cannot be deleted'),
      );
    });
  });

  describe('createProjectTask', () => {
    let originalProjectTaskModel: any;

    beforeEach(() => {
      originalProjectTaskModel = (service as any).projectTaskModel;
    });

    afterEach(() => {
      (service as any).projectTaskModel = originalProjectTaskModel;
    });

    it('should create task with valid location', async () => {
      const projectId = new Types.ObjectId().toString();
      const columnId = new Types.ObjectId().toString();

      const saveMock = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        title: 'Task title',
      });

      const taskConstructorMock = jest.fn().mockImplementation((data) => ({
        ...data,
        save: saveMock,
      }));

      (service as any).projectTaskModel = Object.assign(taskConstructorMock, {
        findOne: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue({ order: 3 }),
            }),
          }),
        }),
      });

      const result = await service.createProjectTask(projectId, columnId, {
        title: 'Task title',
        description: 'Task description',
        labels: ['bug'],
        assigneeIds: [new Types.ObjectId().toString()],
        deadline: '2026-03-30T12:00:00.000Z',
        parentTaskId: new Types.ObjectId().toString(),
        location: {
          type: 'Point',
          coordinates: [30.5234, 50.4501],
        },
      } as any);

      expect(taskConstructorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: expect.any(Types.ObjectId),
          columnId: expect.any(Types.ObjectId),
          title: 'Task title',
          description: 'Task description',
          labels: ['bug'],
          assigneeIds: [expect.any(Types.ObjectId)],
          deadline: expect.any(Date),
          parentTaskId: expect.any(Types.ObjectId),
          location: {
            type: 'Point',
            coordinates: [30.5234, 50.4501],
          },
          order: 4,
        }),
      );

      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({
        _id: expect.any(Types.ObjectId),
        title: 'Task title',
      });
    });

    it('should create task with null location if location is not passed', async () => {
      const projectId = new Types.ObjectId().toString();
      const columnId = new Types.ObjectId().toString();

      const saveMock = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
      });

      const taskConstructorMock = jest.fn().mockImplementation((data) => ({
        ...data,
        save: saveMock,
      }));

      (service as any).projectTaskModel = Object.assign(taskConstructorMock, {
        findOne: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(null),
            }),
          }),
        }),
      });

      await service.createProjectTask(projectId, columnId, {
        title: 'Task title',
      } as any);

      expect(taskConstructorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task title',
          location: null,
          order: 0,
        }),
      );
    });

    it('should throw BadRequestException for invalid project id', async () => {
      await expect(
        service.createProjectTask('bad-id', new Types.ObjectId().toString(), {
          title: 'Task title',
        } as any),
      ).rejects.toThrow(new BadRequestException('Invalid project id'));
    });

    it('should throw BadRequestException for invalid column id', async () => {
      await expect(
        service.createProjectTask(new Types.ObjectId().toString(), 'bad-id', {
          title: 'Task title',
        } as any),
      ).rejects.toThrow(new BadRequestException('Invalid column id'));
    });

    it('should throw BadRequestException for invalid coordinates', async () => {
      const projectId = new Types.ObjectId().toString();
      const columnId = new Types.ObjectId().toString();

      const taskConstructorMock = jest.fn();

      (service as any).projectTaskModel = Object.assign(taskConstructorMock, {
        findOne: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(null),
            }),
          }),
        }),
      });

      await expect(
        service.createProjectTask(projectId, columnId, {
          title: 'Task title',
          location: {
            type: 'Point',
            coordinates: [500, 100],
          },
        } as any),
      ).rejects.toThrow(
        new BadRequestException('Invalid location coordinates'),
      );

      expect(taskConstructorMock).not.toHaveBeenCalled();
    });
  });
});
