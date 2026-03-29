import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import ProjectService from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as jwtPayloadInterface from '../auth/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../infrastracture/dto/pagination.dto';
import { AddProjectColumnDto } from './dto/add-project-column.dto';
import { ProjectAccessGuarded } from './decorators/project-access-guarded.decorator';
import { ProjectRole } from './schemas/project-member.schema';
import { AddProjectTaskDto } from './dto/add-project-task.dto';
import { FilterMembersDto } from './dto/filter-members.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetColumnTasksDto } from './dto/get-column-tasks.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectColumnDto } from './dto/update-project-column.dto';
import { SearchProjectUsersDto } from './dto/search-project-users.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';
import { CreateProjectTaskCommentDto } from './dto/create-project-task-comment.dto';

@Controller('project')
@UseGuards(AuthGuard('jwt'))
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.createProject(dto, user.userId);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Patch(':projectId')
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() data: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(projectId, data);
  }

  @Get()
  async getProjects(
    @Query() dto: PaginationDto,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.getProjects(dto, user.userId);
  }

  @ProjectAccessGuarded()
  @Get(':projectId')
  async getProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.getProjectBoard(projectId, user.userId);
  }

  @ProjectAccessGuarded(ProjectRole.OWNER)
  @Delete(':projectId')
  async deleteProject(@Param('projectId') projectId: string) {
    return this.projectService.deleteProject(projectId);
  }

  @Post(':projectId/members')
  @HttpCode(HttpStatus.OK)
  async addMember(
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectMemberDto,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.addMembers(projectId, dto, user.userId);
  }

  @ProjectAccessGuarded()
  @Get(':projectId/member')
  @HttpCode(HttpStatus.OK)
  async getMembers(
    @Param('projectId') projectId: string,
    @Query() filterMembers: FilterMembersDto,
  ) {
    return this.projectService.getMembers(projectId, filterMembers);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Delete(':projectId/member/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.removeMember(projectId, memberId, user.userId);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Get(':projectId/member/search-users')
  @HttpCode(HttpStatus.OK)
  async searchUsersForAdd(
    @Param('projectId') projectId: string,
    @Query() query: SearchProjectUsersDto,
  ) {
    return this.projectService.searchUsersForAdd(projectId, query);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Patch(':projectId/member/:memberId/role')
  @HttpCode(HttpStatus.OK)
  async updateMemberRole(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateProjectMemberRoleDto,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.updateMemberRole(
      projectId,
      memberId,
      dto,
      user.userId,
    );
  }

  @ProjectAccessGuarded(ProjectRole.MEMBER)
  @Post(':projectId/column')
  @HttpCode(HttpStatus.OK)
  async createProjectBoardColum(
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectColumnDto,
  ) {
    return this.projectService.addProjectColumn(projectId, dto);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Delete(':projectId/column/:columnId')
  @HttpCode(HttpStatus.OK)
  async deleteProjectBoardColum(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.projectService.deleteProjectColumn(projectId, columnId);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Patch(':projectId/column/:columnId')
  async updateProjectColumn(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Body() data: UpdateProjectColumnDto,
  ) {
    return this.projectService.updateProjectColumn(projectId, columnId, data);
  }

  @ProjectAccessGuarded(ProjectRole.MEMBER)
  @Post(':projectId/column/:columnId/task')
  @HttpCode(HttpStatus.OK)
  async createColumTask(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Body() dto: AddProjectTaskDto,
  ) {
    return this.projectService.createProjectTask(projectId, columnId, dto);
  }

  @ProjectAccessGuarded()
  @Get(':projectId/column/:columnId/task')
  @HttpCode(HttpStatus.OK)
  async getColumTasks(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Query() data: GetColumnTasksDto,
  ) {
    return this.projectService.getColumnTasks(projectId, columnId, data);
  }

  @ProjectAccessGuarded(ProjectRole.MEMBER)
  @Patch(':projectId/column/:columnId/task/:taskId')
  @HttpCode(HttpStatus.OK)
  async updateColumnTask(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Body() body: UpdateTaskDto,
  ) {
    return this.projectService.updateColumnTask(
      projectId,
      columnId,
      taskId,
      body,
    );
  }

  @ProjectAccessGuarded(ProjectRole.MEMBER)
  @Patch(':projectId/column/:columnId/task/:taskId/status')
  @HttpCode(HttpStatus.OK)
  async updateColumnTaskStatus(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Body() body: ChangeTaskStatusDto,
  ) {
    return this.projectService.updateColumnTaskStatus(
      projectId,
      columnId,
      taskId,
      body,
    );
  }

  @ProjectAccessGuarded()
  @Post(':projectId/task/:taskId/comment')
  @HttpCode(HttpStatus.CREATED)
  async createTaskComment(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateProjectTaskCommentDto,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.createTaskComment(
      projectId,
      taskId,
      dto,
      user.userId,
    );
  }

  @ProjectAccessGuarded()
  @Get(':projectId/task/:taskId/comment')
  @HttpCode(HttpStatus.OK)
  async getTaskComments(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Query() pagination: PaginationDto,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.getTaskComments(
      projectId,
      taskId,
      pagination,
      user.userId,
    );
  }
}
