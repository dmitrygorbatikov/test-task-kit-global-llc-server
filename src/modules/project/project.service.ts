import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import {
  DefaultColumns,
  Project,
  ProjectDocument,
} from './schemas/project.schema';
import {
  ProjectMember,
  ProjectMemberDocument,
  ProjectRole,
} from './schemas/project-member.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { PaginationDto } from '../../infrastracture/dto/pagination.dto';
import {
  ProjectColumn,
  ProjectColumnDocument,
} from './schemas/project-column.schema';
import {
  ProjectTask,
  ProjectTaskDocument,
  TaskStatus,
} from './schemas/project-task.schema';
import { AddProjectColumnDto } from './dto/add-project-column.dto';
import { AddProjectTaskDto } from './dto/add-project-task.dto';
import { FilterMembersDto } from './dto/filter-members.dto';
import { UserService } from '../user/user.service';
import { CursorPaginationDto } from '../../infrastracture/dto/cursor-pagination.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetColumnTasksDto } from './dto/get-column-tasks.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectColumnDto } from './dto/update-project-column.dto';
import { SearchProjectUsersDto } from './dto/search-project-users.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';
import {
  ProjectTaskComment,
  ProjectTaskCommentDocument,
} from './schemas/project-task-comment.schema';
import { CreateProjectTaskCommentDto } from './dto/create-project-task-comment.dto';

@Injectable()
class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectMember.name)
    private projectMemberModel: Model<ProjectMemberDocument>,
    @InjectModel(ProjectColumn.name)
    private projectColumnModel: Model<ProjectColumnDocument>,
    @InjectModel(ProjectTask.name)
    private projectTaskModel: Model<ProjectTaskDocument>,
    @InjectModel(ProjectTaskComment.name)
    private projectTaskCommentModel: Model<ProjectTaskCommentDocument>,
    private readonly userService: UserService,
  ) {}

  async getProjects(dto: PaginationDto, userId: string) {
    const page = dto.page;
    const perPage = dto.perPage;
    const skip = (page - 1) * perPage;

    const userObjectId = new Types.ObjectId(userId);

    const [projects, total] = await Promise.all([
      this.projectModel.aggregate([
        {
          $match: {
            deletedAt: null,
          },
        },
        {
          $lookup: {
            from: 'projectmembers',
            let: { projectId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$projectId', '$$projectId'] },
                      { $eq: ['$userId', userObjectId] },
                      { $eq: ['$deletedAt', null] },
                    ],
                  },
                },
              },
            ],
            as: 'memberInfo',
          },
        },
        {
          $match: {
            $or: [
              { ownerId: userObjectId },
              { 'memberInfo.0': { $exists: true } },
            ],
          },
        },
        {
          $addFields: {
            role: {
              $cond: [
                { $eq: ['$ownerId', userObjectId] },
                'owner',
                { $arrayElemAt: ['$memberInfo.role', 0] },
              ],
            },
          },
        },
        {
          $project: {
            memberInfo: 0,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: perPage,
        },
      ]),
      this.projectModel.aggregate([
        {
          $match: {
            deletedAt: null,
          },
        },
        {
          $lookup: {
            from: 'projectmembers',
            let: { projectId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$projectId', '$$projectId'] },
                      { $eq: ['$userId', userObjectId] },
                      { $eq: ['$deletedAt', null] },
                    ],
                  },
                },
              },
            ],
            as: 'memberInfo',
          },
        },
        {
          $match: {
            $or: [
              { ownerId: userObjectId },
              { 'memberInfo.0': { $exists: true } },
            ],
          },
        },
        {
          $count: 'total',
        },
      ]),
    ]);

    const totalCount = total[0]?.total ?? 0;

    return {
      data: projects,
      meta: {
        total: totalCount,
        page,
        perPage,
        lastPage: Math.ceil(totalCount / perPage),
      },
    };
  }

  async deleteProject(projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    const projectObjectId = new Types.ObjectId(projectId);
    const deletedAt = new Date();

    const session = await this.projectModel.db.startSession();

    try {
      session.startTransaction();

      const project = await this.projectModel.findOne(
        {
          _id: projectObjectId,
          deletedAt: null,
        },
        null,
        { session },
      );

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      await this.projectModel.updateOne(
        {
          _id: projectObjectId,
          deletedAt: null,
        },
        {
          $set: { deletedAt },
        },
        { session },
      );

      await Promise.all([
        this.projectColumnModel.updateMany(
          {
            projectId: projectObjectId,
            deletedAt: null,
          },
          {
            $set: { deletedAt },
          },
          { session },
        ),
        this.projectTaskModel.updateMany(
          {
            projectId: projectObjectId,
            deletedAt: null,
          },
          {
            $set: { deletedAt },
          },
          { session },
        ),
        this.projectTaskCommentModel.updateMany(
          {
            projectId: projectObjectId,
            deletedAt: null,
          },
          {
            $set: { deletedAt },
          },
          { session },
        ),
        this.projectMemberModel.updateMany(
          {
            projectId: projectObjectId,
            deletedAt: null,
          },
          {
            $set: { deletedAt },
          },
          { session },
        ),
      ]);

      await session.commitTransaction();

      return {
        success: true,
        message: 'Project deleted successfully',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getProjectBoard(projectId: string, userId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    const projectObjectId = new Types.ObjectId(projectId);
    const userObjectId = new Types.ObjectId(userId);

    const project = await this.projectModel
      .findOne({
        _id: projectObjectId,
        deletedAt: null,
      })
      .select('title description ownerId createdAt updatedAt')
      .lean();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const member = await this.projectMemberModel
      .findOne({
        projectId: projectObjectId,
        userId: userObjectId,
        deletedAt: null,
      })
      .select('role')
      .lean();

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const columns = await this.projectColumnModel
      .find({
        projectId: projectObjectId,
        deletedAt: null,
      })
      .sort({ order: 1 })
      .select('title order')
      .lean();

    return {
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        ownerId: project.ownerId,
        role: member.role,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      columns,
    };
  }

  async getColumnTasks(
    projectId: string,
    columnId: string,
    data: GetColumnTasksDto,
  ) {
    const { cursor, limit = 20, statuses = [TaskStatus.ACTIVE] } = data;

    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    if (!Types.ObjectId.isValid(columnId)) {
      throw new BadRequestException('Invalid column id');
    }

    const columnExists = await this.projectColumnModel.exists({
      _id: new Types.ObjectId(columnId),
      projectId: new Types.ObjectId(projectId),
      deletedAt: null,
    });

    if (!columnExists) {
      throw new NotFoundException('Column not found');
    }

    const query: any = {
      projectId: new Types.ObjectId(projectId),
      columnId: new Types.ObjectId(columnId),
      deletedAt: null,
      status: { $in: statuses },
    };

    if (cursor) {
      const [lastOrderStr, lastIdStr] = cursor.split('_');

      if (!lastOrderStr || !lastIdStr || !Types.ObjectId.isValid(lastIdStr)) {
        throw new BadRequestException('Invalid cursor');
      }

      const lastOrder = Number(lastOrderStr);

      if (Number.isNaN(lastOrder)) {
        throw new BadRequestException('Invalid cursor');
      }

      query.$or = [
        { order: { $gt: lastOrder } },
        {
          order: lastOrder,
          _id: { $gt: new Types.ObjectId(lastIdStr) },
        },
      ];
    }

    const tasks = await this.projectTaskModel
      .find(query)
      .sort({ order: 1, _id: 1 })
      .limit(limit + 1)
      .populate('assignees', 'fullName email avatar')
      .lean();

    const hasMore = tasks.length > limit;
    const items = hasMore ? tasks.slice(0, limit) : tasks;

    const lastItem = items[items.length - 1];

    const nextCursor =
      hasMore && lastItem ? `${lastItem.order}_${lastItem._id}` : null;

    return {
      data: items,
      meta: {
        limit,
        hasMore,
        nextCursor,
      },
      columnId,
    };
  }

  async createProject(dto: CreateProjectDto, userId: string) {
    const existingProject = await this.projectModel.findOne({
      title: dto.title,
      ownerId: userId,
    });

    if (existingProject) {
      throw new ConflictException(
        `Project with title ${dto.title} already exists in your list`,
      );
    }

    const session = await this.projectModel.db.startSession();

    try {
      session.startTransaction();

      const [newProject] = await this.projectModel.create(
        [
          {
            title: dto.title,
            description: dto.description,
            ownerId: new Types.ObjectId(userId),
          },
        ],
        { session },
      );

      await this.projectMemberModel.create(
        [
          {
            projectId: newProject._id,
            userId: new Types.ObjectId(userId),
            role: ProjectRole.OWNER,
          },
        ],
        { session },
      );

      const defaultColumns = [
        { title: DefaultColumns.BACKLOG, order: 0 },
        { title: DefaultColumns.TODO, order: 1 },
        { title: DefaultColumns.INPROGRESS, order: 2 },
        { title: DefaultColumns.REVIEW, order: 3 },
        { title: DefaultColumns.DONE, order: 4 },
      ];

      await this.projectColumnModel.insertMany(
        defaultColumns.map((col) => ({
          projectId: newProject._id,
          title: col.title,
          order: col.order,
        })),
        { session },
      );

      await session.commitTransaction();

      return this.getProjectWithDetails(newProject._id.toString());
    } catch (error) {
      await session.abortTransaction();
      console.error('Create project failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateProject(projectId: string, data: UpdateProjectDto) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    const updateData: Partial<UpdateProjectDto> = {};

    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }

    try {
      const project = await this.projectModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(projectId),
          deletedAt: null,
        },
        {
          $set: updateData,
        },
        {
          new: true,
        },
      );

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return project;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Project with this title already exists');
      }

      throw error;
    }
  }

  async addMembers(
    projectId: string,
    dto: AddProjectMemberDto,
    currentUserId: string,
  ) {
    const session = await this.projectModel.db.startSession();

    try {
      session.startTransaction();

      const projectObjectId = new Types.ObjectId(projectId);
      const currentUserObjectId = new Types.ObjectId(currentUserId);
      const userObjectIds = dto.userIds.map((id) => new Types.ObjectId(id));

      const project = await this.projectModel.findOne(
        { _id: projectObjectId, deletedAt: null },
        null,
        { session },
      );

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const currentMember = await this.projectMemberModel.findOne(
        {
          projectId: projectObjectId,
          userId: currentUserObjectId,
          deletedAt: null,
        },
        null,
        { session },
      );

      if (!currentMember) {
        throw new ForbiddenException('You are not a member');
      }

      if (
        ![ProjectRole.OWNER, ProjectRole.ADMIN].includes(currentMember.role)
      ) {
        throw new ForbiddenException('No permission');
      }

      const existingUsers = await this.userService.getExistingUsers(
        userObjectIds,
        session,
      );

      const existingUserIdsSet = new Set(
        existingUsers.map((user) => user._id.toString()),
      );

      const notFoundUserIds = dto.userIds.filter(
        (id) => !existingUserIdsSet.has(id),
      );

      if (notFoundUserIds.length) {
        throw new BadRequestException({
          message: 'Some users not found',
          userIds: notFoundUserIds,
        });
      }

      const existingMembers = await this.projectMemberModel.find(
        {
          projectId: projectObjectId,
          userId: { $in: userObjectIds },
          deletedAt: null,
        },
        { userId: 1 },
        { session },
      );

      const existingMemberIdsSet = new Set(
        existingMembers.map((member) => member.userId.toString()),
      );

      const membersToCreate = userObjectIds
        .filter((userId) => !existingMemberIdsSet.has(userId.toString()))
        .map((userId) => ({
          projectId: projectObjectId,
          userId,
          role: dto.role,
        }));

      if (!membersToCreate.length) {
        throw new BadRequestException('All users are already members');
      }

      const createdMembers = await this.projectMemberModel.insertMany(
        membersToCreate,
        {
          session,
          ordered: true,
        },
      );

      await session.commitTransaction();

      return {
        message: 'Members added',
        data: createdMembers,
        meta: {
          addedCount: createdMembers.length,
          skippedCount: existingMembers.length,
        },
      };
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  }

  async getMembers(projectId: string, filter: FilterMembersDto) {
    const { page, perPage } = filter;

    const skip = (page - 1) * perPage;

    const match: any = {
      projectId: new Types.ObjectId(projectId),
      deletedAt: null,
    };

    if (filter?.role) {
      match.role = filter.role;
    }

    const pipeline: any[] = [
      { $match: match },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    if (filter?.search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.fullName': { $regex: filter.search, $options: 'i' } },
            { 'user.email': { $regex: filter.search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: perPage },
        ],
        total: [{ $count: 'count' }],
      },
    });

    const result = await this.projectMemberModel.aggregate(pipeline);

    const data = result[0].data;
    const total = result[0].total[0]?.count || 0;

    return {
      data,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async removeMember(
    projectId: string,
    memberId: string,
    currentUserId: string,
  ) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid member id');
    }

    if (!Types.ObjectId.isValid(currentUserId)) {
      throw new BadRequestException('Invalid current user id');
    }

    const session = await this.projectModel.db.startSession();

    try {
      session.startTransaction();

      const projectObjectId = new Types.ObjectId(projectId);
      const memberObjectId = new Types.ObjectId(memberId);
      const currentUserObjectId = new Types.ObjectId(currentUserId);

      const project = await this.projectModel.findOne(
        { _id: projectObjectId, deletedAt: null },
        null,
        { session },
      );

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const currentMember = await this.projectMemberModel.findOne(
        {
          projectId: projectObjectId,
          userId: currentUserObjectId,
          deletedAt: null,
        },
        null,
        { session },
      );

      if (!currentMember) {
        throw new ForbiddenException('You are not a member');
      }

      if (
        ![ProjectRole.OWNER, ProjectRole.ADMIN].includes(currentMember.role)
      ) {
        throw new ForbiddenException('No permission');
      }

      if (memberId === currentUserId) {
        throw new BadRequestException('You cannot remove yourself');
      }

      const targetMember = await this.projectMemberModel.findOne(
        {
          projectId: projectObjectId,
          userId: memberObjectId,
          deletedAt: null,
        },
        null,
        { session },
      );

      if (!targetMember) {
        throw new NotFoundException('Member not found');
      }

      if (targetMember.role === ProjectRole.OWNER) {
        throw new BadRequestException('Cannot remove project owner');
      }

      if (
        currentMember.role === ProjectRole.ADMIN &&
        targetMember.role === ProjectRole.ADMIN
      ) {
        throw new ForbiddenException('Admin cannot remove another admin');
      }

      await this.projectMemberModel.updateOne(
        {
          _id: targetMember._id,
          deletedAt: null,
        },
        {
          $set: { deletedAt: new Date() },
        },
        { session },
      );

      await session.commitTransaction();

      return {
        message: 'Member removed successfully',
      };
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  }

  async searchUsersForAdd(projectId: string, query: SearchProjectUsersDto) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    const { search, page = 1, perPage = 10 } = query;
    const projectObjectId = new Types.ObjectId(projectId);
    const skip = (page - 1) * perPage;

    const project = await this.projectModel.findOne({
      _id: projectObjectId,
      deletedAt: null,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const existingMembers = await this.projectMemberModel.find(
      {
        projectId: projectObjectId,
        deletedAt: null,
      },
      { userId: 1 },
    );

    const excludedUserIds = existingMembers.map((item) => item.userId);

    const userMatch: any = {};

    if (search?.trim()) {
      userMatch.$or = [
        { fullName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (excludedUserIds.length > 0) {
      userMatch._id = { $nin: excludedUserIds };
    }

    const [users, total] = await Promise.all([
      this.userService.getUsersByMatch(userMatch, skip, perPage),
      this.userService.getUsersCountByMatch(userMatch),
    ]);

    return {
      data: users,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async updateMemberRole(
    projectId: string,
    memberId: string,
    dto: UpdateProjectMemberRoleDto,
    currentUserId: string,
  ) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid member id');
    }

    if (!Types.ObjectId.isValid(currentUserId)) {
      throw new BadRequestException('Invalid current user id');
    }

    const projectObjectId = new Types.ObjectId(projectId);
    const targetUserObjectId = new Types.ObjectId(memberId);
    const currentUserObjectId = new Types.ObjectId(currentUserId);

    const session = await this.projectModel.db.startSession();

    try {
      session.startTransaction();

      const project = await this.projectModel.findOne(
        {
          _id: projectObjectId,
          deletedAt: null,
        },
        null,
        { session },
      );

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const currentMember = await this.projectMemberModel.findOne(
        {
          projectId: projectObjectId,
          userId: currentUserObjectId,
          deletedAt: null,
        },
        null,
        { session },
      );

      if (!currentMember) {
        throw new ForbiddenException('You are not a member');
      }

      if (
        ![ProjectRole.OWNER, ProjectRole.ADMIN].includes(currentMember.role)
      ) {
        throw new ForbiddenException('No permission');
      }

      const targetMember = await this.projectMemberModel.findOne(
        {
          projectId: projectObjectId,
          userId: targetUserObjectId,
          deletedAt: null,
        },
        null,
        { session },
      );

      if (!targetMember) {
        throw new NotFoundException('Member not found');
      }

      if (targetMember.role === ProjectRole.OWNER) {
        throw new BadRequestException('Owner role cannot be changed');
      }

      if (dto.role === ProjectRole.OWNER) {
        throw new BadRequestException('Cannot assign owner role');
      }

      if (targetMember.userId.toString() === currentUserId) {
        throw new BadRequestException('You cannot change your own role');
      }

      if (currentMember.role === ProjectRole.ADMIN) {
        if (targetMember.role === ProjectRole.ADMIN) {
          throw new ForbiddenException(
            'Admin cannot change role of another admin',
          );
        }

        if (
          targetMember.role !== ProjectRole.MEMBER ||
          dto.role !== ProjectRole.ADMIN
        ) {
          throw new ForbiddenException(
            'Admin can only promote member to admin',
          );
        }
      }

      if (currentMember.role === ProjectRole.OWNER) {
        if (![ProjectRole.MEMBER, ProjectRole.ADMIN].includes(dto.role)) {
          throw new BadRequestException('Invalid target role');
        }
      }

      targetMember.role = dto.role;
      await targetMember.save({ session });

      await session.commitTransaction();

      return {
        message: 'Member role updated successfully',
        data: {
          _id: targetMember._id,
          projectId: targetMember.projectId,
          userId: targetMember.userId,
          role: targetMember.role,
        },
      };
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  }

  public async addProjectColumn(projectId: string, data: AddProjectColumnDto) {
    const projectObjectId = new Types.ObjectId(projectId);

    const existingColumn = await this.projectColumnModel.findOne({
      title: data.title,
      projectId: projectObjectId,
    });

    if (existingColumn) {
      throw new ConflictException(
        `Column with title '${data.title}' already exists for this project`,
      );
    }

    const lastColumn = await this.projectColumnModel
      .findOne({
        projectId: projectObjectId,
        deletedAt: null,
      })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const nextOrder = (lastColumn?.order ?? -1) + 1;

    return await this.projectColumnModel.create({
      projectId: projectObjectId,
      title: data.title,
      order: nextOrder,
    });
  }

  public async deleteProjectColumn(projectId: string, columnId: string) {
    const projectObjectId = new Types.ObjectId(projectId);
    const columnObjectId = new Types.ObjectId(columnId);

    const project = await this.projectModel.findOne({
      _id: projectObjectId,
      deletedAt: null,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const column = await this.projectColumnModel.findOne({
      _id: columnObjectId,
      projectId: projectObjectId,
      deletedAt: null,
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const backlogColumn = await this.projectColumnModel.findOne({
      projectId: projectObjectId,
      title: DefaultColumns.BACKLOG,
      deletedAt: null,
    });

    if (!backlogColumn) {
      throw new NotFoundException('Backlog column not found');
    }

    if (column._id.equals(backlogColumn._id)) {
      throw new BadRequestException('Backlog column cannot be deleted');
    }

    const session = await this.projectColumnModel.db.startSession();

    try {
      session.startTransaction();

      await this.projectTaskModel.updateMany(
        {
          projectId: projectObjectId,
          columnId: columnObjectId,
          deletedAt: null,
        },
        {
          $set: {
            columnId: backlogColumn._id,
          },
        },
        { session },
      );

      await this.projectColumnModel.updateOne(
        { _id: columnObjectId },
        { $set: { deletedAt: new Date() } },
        { session },
      );

      await session.commitTransaction();

      return {
        message: 'Column removed successfully',
      };
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      await session.endSession();
    }
  }

  async updateProjectColumn(
    projectId: string,
    columnId: string,
    data: UpdateProjectColumnDto,
  ) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    if (!Types.ObjectId.isValid(columnId)) {
      throw new BadRequestException('Invalid column id');
    }

    const updateData: Partial<UpdateProjectColumnDto> = {};

    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }

    try {
      const column = await this.projectColumnModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(columnId),
          projectId: new Types.ObjectId(projectId),
          deletedAt: null,
        },
        {
          $set: updateData,
        },
        {
          new: true,
        },
      );

      if (!column) {
        throw new NotFoundException('Column not found');
      }

      return column;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Column with this title already exists');
      }

      throw error;
    }
  }

  public async createProjectTask(
    projectId: string,
    columnId: string,
    data: AddProjectTaskDto,
  ): Promise<ProjectTask> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    if (!Types.ObjectId.isValid(columnId)) {
      throw new BadRequestException('Invalid column id');
    }

    const projectObjectId = new Types.ObjectId(projectId);
    const columnObjectId = new Types.ObjectId(columnId);

    const lastColumnTask = await this.projectTaskModel
      .findOne({
        projectId: projectObjectId,
        columnId: columnObjectId,
        deletedAt: null,
      })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const nextOrder = (lastColumnTask?.order ?? -1) + 1;

    let location: {
      type: 'Point';
      coordinates: [number, number];
    } | null = null;

    if (data.location) {
      const [longitude, latitude] = data.location.coordinates;

      if (
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new BadRequestException('Invalid location coordinates');
      }

      location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    const task = new this.projectTaskModel({
      projectId: projectObjectId,
      columnId: columnObjectId,
      title: data.title,
      description: data.description,
      labels: data.labels || [],
      assigneeIds: data.assigneeIds?.map((id) => new Types.ObjectId(id)) || [],
      deadline: data.deadline ? new Date(data.deadline) : null,
      parentTaskId: data.parentTaskId
        ? new Types.ObjectId(data.parentTaskId)
        : null,
      location,
      order: nextOrder,
    });

    return task.save();
  }

  async updateColumnTask(
    projectId: string,
    columnId: string,
    taskId: string,
    body: UpdateTaskDto,
  ): Promise<ProjectTask> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    if (!Types.ObjectId.isValid(columnId)) {
      throw new BadRequestException('Invalid column id');
    }

    if (!Types.ObjectId.isValid(taskId)) {
      throw new BadRequestException('Invalid task id');
    }

    const projectObjectId = new Types.ObjectId(projectId);
    const columnObjectId = new Types.ObjectId(columnId);
    const taskObjectId = new Types.ObjectId(taskId);

    const currentTask = await this.projectTaskModel.findOne({
      _id: taskObjectId,
      projectId: projectObjectId,
      columnId: columnObjectId,
      deletedAt: null,
    });

    if (!currentTask) {
      throw new NotFoundException('Task not found');
    }

    const setData: Record<string, any> = {};
    const unsetData: Record<string, any> = {};

    if (body.title !== undefined) {
      setData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      setData.description = body.description;
    }

    if (body.labels !== undefined) {
      setData.labels = body.labels;
    }

    if (body.assigneeIds !== undefined) {
      setData.assigneeIds = body.assigneeIds.map(
        (id) => new Types.ObjectId(id),
      );
    }

    if (body.deadline !== undefined) {
      setData.deadline = body.deadline ? new Date(body.deadline) : null;
    }

    if (body.parentTaskId !== undefined) {
      setData.parentTaskId = body.parentTaskId
        ? new Types.ObjectId(body.parentTaskId)
        : null;
    }

    if (body.columnId !== undefined) {
      setData.columnId = body.columnId
        ? new Types.ObjectId(body.columnId)
        : null;
    }

    if (body.order !== undefined) {
      setData.order = body.order;
    }

    if (body.removeLocation) {
      unsetData.location = 1;
    } else if (body.location !== undefined) {
      const [longitude, latitude] = body.location.coordinates;

      if (
        Number.isNaN(longitude) ||
        Number.isNaN(latitude) ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new BadRequestException('Invalid location coordinates');
      }

      setData.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    const updateQuery: Record<string, any> = {};

    if (Object.keys(setData).length > 0) {
      updateQuery.$set = setData;
    }

    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData;
    }

    if (Object.keys(updateQuery).length === 0) {
      const task = await this.projectTaskModel
        .findOne({
          _id: taskObjectId,
          projectId: projectObjectId,
          columnId: currentTask.columnId,
          deletedAt: null,
        })
        .populate('assignees', 'fullName email avatar');

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      return task;
    }

    const updatedTask = await this.projectTaskModel
      .findOneAndUpdate(
        {
          _id: taskObjectId,
          projectId: projectObjectId,
          columnId: currentTask.columnId,
          deletedAt: null,
        },
        updateQuery,
        {
          new: true,
        },
      )
      .populate('assignees', 'fullName email avatar');

    if (!updatedTask) {
      throw new NotFoundException('Task not found');
    }

    return updatedTask;
  }

  async updateColumnTaskStatus(
    projectId: string,
    columnId: string,
    taskId: string,
    body: ChangeTaskStatusDto,
  ) {
    const { status } = body;

    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project id');
    }

    if (!Types.ObjectId.isValid(columnId)) {
      throw new BadRequestException('Invalid column id');
    }

    if (!Types.ObjectId.isValid(taskId)) {
      throw new BadRequestException('Invalid task id');
    }

    const column = await this.projectColumnModel.findOne({
      _id: new Types.ObjectId(columnId),
      projectId: new Types.ObjectId(projectId),
      deletedAt: null,
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const task = await this.projectTaskModel.findOne({
      _id: new Types.ObjectId(taskId),
      projectId: new Types.ObjectId(projectId),
      columnId: new Types.ObjectId(columnId),
      deletedAt: null,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.status = status;
    await task.save();

    return task.toObject();
  }

  public async createTaskComment(
    projectId: string,
    taskId: string,
    dto: CreateProjectTaskCommentDto,
    currentUserId: string,
  ) {
    const projectObjectId = new Types.ObjectId(projectId);
    const taskObjectId = new Types.ObjectId(taskId);
    const currentUserObjectId = new Types.ObjectId(currentUserId);

    const project = await this.projectModel.findOne({
      _id: projectObjectId,
      deletedAt: null,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const member = await this.projectMemberModel.findOne({
      projectId: projectObjectId,
      userId: currentUserObjectId,
      deletedAt: null,
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const task = await this.projectTaskModel.findOne({
      _id: taskObjectId,
      projectId: projectObjectId,
      deletedAt: null,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    let parentCommentObjectId: Types.ObjectId | null = null;

    if (dto.parentCommentId) {
      parentCommentObjectId = new Types.ObjectId(dto.parentCommentId);

      const parentComment = await this.projectTaskCommentModel.findOne({
        _id: parentCommentObjectId,
        taskId: taskObjectId,
        projectId: projectObjectId,
        deletedAt: null,
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.projectTaskCommentModel.create({
      projectId: projectObjectId,
      taskId: taskObjectId,
      authorId: currentUserObjectId,
      content: dto.content.trim(),
      parentCommentId: parentCommentObjectId,
    });

    return this.projectTaskCommentModel
      .findById(comment._id)
      .populate('author')
      .lean();
  }

  public async getTaskComments(
    projectId: string,
    taskId: string,
    pagination: PaginationDto,
    currentUserId: string,
  ) {
    const projectObjectId = new Types.ObjectId(projectId);
    const taskObjectId = new Types.ObjectId(taskId);
    const currentUserObjectId = new Types.ObjectId(currentUserId);

    const project = await this.projectModel.findOne({
      _id: projectObjectId,
      deletedAt: null,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const member = await this.projectMemberModel.findOne({
      projectId: projectObjectId,
      userId: currentUserObjectId,
      deletedAt: null,
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const task = await this.projectTaskModel.findOne({
      _id: taskObjectId,
      projectId: projectObjectId,
      deletedAt: null,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const page = pagination.page ?? 1;
    const perPage = pagination.perPage ?? 20;
    const skip = (page - 1) * perPage;

    const rootComments = await this.projectTaskCommentModel
      .find({
        projectId: projectObjectId,
        taskId: taskObjectId,
        parentCommentId: null,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .populate('author')
      .lean();

    const total = await this.projectTaskCommentModel.countDocuments({
      projectId: projectObjectId,
      taskId: taskObjectId,
      parentCommentId: null,
      deletedAt: null,
    });

    if (!rootComments.length) {
      return {
        items: [],
        meta: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    }

    const rootCommentIds = rootComments.map((comment) => comment._id);

    const allReplies: any[] = [];
    let parentIds = [...rootCommentIds];

    while (parentIds.length) {
      const replies = await this.projectTaskCommentModel
        .find({
          projectId: projectObjectId,
          taskId: taskObjectId,
          parentCommentId: { $in: parentIds },
          deletedAt: null,
        })
        .sort({ createdAt: 1 })
        .populate('author')
        .lean();

      if (!replies.length) {
        break;
      }

      allReplies.push(...replies);
      parentIds = replies.map((reply) => reply._id);
    }

    const commentMap = new Map<string, any>();

    for (const comment of rootComments) {
      commentMap.set(String(comment._id), {
        ...comment,
        replies: [],
      });
    }

    for (const reply of allReplies) {
      commentMap.set(String(reply._id), {
        ...reply,
        replies: [],
      });
    }

    for (const reply of allReplies) {
      const parentId = String(reply.parentCommentId);
      const parentComment = commentMap.get(parentId);

      if (parentComment) {
        parentComment.replies.push(commentMap.get(String(reply._id)));
      }
    }

    const items = rootComments.map((comment) =>
      commentMap.get(String(comment._id)),
    );

    return {
      items,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  private async getProjectWithDetails(projectId: string) {
    return this.projectModel
      .findById(projectId)
      .populate('owner')
      .populate({
        path: 'members',
        populate: { path: 'user' },
        match: { deletedAt: null },
      })
      .exec();
  }
}

export default ProjectService;
