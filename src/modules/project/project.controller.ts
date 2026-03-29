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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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

import { ProjectResponseDto } from './responses/project-response.dto';
import { ProjectListResponseDto } from './responses/project-list-response.dto';
import { ProjectBoardResponseDto } from './responses/project-board-response.dto';
import { ProjectMembersResponseDto } from './responses/project-members-response.dto';
import { SearchProjectUsersResponseDto } from './responses/search-project-users-response.dto';
import { AddMembersResponseDto } from './responses/add-members-response.dto';
import { ProjectColumnResponseDto } from './responses/project-column-response.dto';
import { ProjectTaskResponseDto } from './responses/project-task-response.dto';
import { ColumnTasksResponseDto } from './responses/column-tasks-response.dto';
import { ProjectTaskCommentResponseDto } from './responses/project-task-comment-response.dto';
import { TaskCommentsResponseDto } from './responses/task-comments-response.dto';
import { SuccessMessageResponseDto } from './responses/success-message-response.dto';
import { ProjectMemberResponseDto } from './responses/project-member-response.dto';

@ApiTags('Project')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('project')
@UseGuards(AuthGuard('jwt'))
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiCreatedResponse({
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  async createProject(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.createProject(dto, user.userId);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Patch(':projectId')
  @ApiOperation({ summary: 'Update project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiOkResponse({
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() data: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(projectId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get user projects' })
  @ApiOkResponse({
    description: 'Paginated list of user projects',
    type: ProjectListResponseDto,
  })
  async getProjects(
    @Query() dto: PaginationDto,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.getProjects(dto, user.userId);
  }

  @ProjectAccessGuarded()
  @Get(':projectId')
  @ApiOperation({ summary: 'Get project board' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiOkResponse({
    description: 'Project board with columns',
    type: ProjectBoardResponseDto,
  })
  async getProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return this.projectService.getProjectBoard(projectId, user.userId);
  }

  @ProjectAccessGuarded(ProjectRole.OWNER)
  @Delete(':projectId')
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiOkResponse({
    description: 'Project deleted successfully',
    type: SuccessMessageResponseDto,
  })
  async deleteProject(@Param('projectId') projectId: string) {
    return this.projectService.deleteProject(projectId);
  }

  @Post(':projectId/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add members to project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiBody({ type: AddProjectMemberDto })
  @ApiOkResponse({
    description: 'Members added successfully',
    type: AddMembersResponseDto,
  })
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
  @ApiOperation({ summary: 'Get project members' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiOkResponse({
    description: 'Paginated list of project members',
    type: ProjectMembersResponseDto,
  })
  async getMembers(
    @Param('projectId') projectId: string,
    @Query() filterMembers: FilterMembersDto,
  ) {
    return this.projectService.getMembers(projectId, filterMembers);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Delete(':projectId/member/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID' })
  @ApiOkResponse({
    description: 'Member removed successfully',
    type: SuccessMessageResponseDto,
  })
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
  @ApiOperation({ summary: 'Search users to add to project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiOkResponse({
    description: 'Paginated list of available users',
    type: SearchProjectUsersResponseDto,
  })
  async searchUsersForAdd(
    @Param('projectId') projectId: string,
    @Query() query: SearchProjectUsersDto,
  ) {
    return this.projectService.searchUsersForAdd(projectId, query);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Patch(':projectId/member/:memberId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update project member role' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID' })
  @ApiBody({ type: UpdateProjectMemberRoleDto })
  @ApiOkResponse({
    description: 'Member role updated successfully',
    type: ProjectMemberResponseDto,
  })
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
  @ApiOperation({ summary: 'Create project column' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiBody({ type: AddProjectColumnDto })
  @ApiOkResponse({
    description: 'Column created successfully',
    type: ProjectColumnResponseDto,
  })
  async createProjectBoardColum(
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectColumnDto,
  ) {
    return this.projectService.addProjectColumn(projectId, dto);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Delete(':projectId/column/:columnId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete project column' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiOkResponse({
    description: 'Column deleted successfully',
    type: SuccessMessageResponseDto,
  })
  async deleteProjectBoardColum(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.projectService.deleteProjectColumn(projectId, columnId);
  }

  @ProjectAccessGuarded(ProjectRole.ADMIN)
  @Patch(':projectId/column/:columnId')
  @ApiOperation({ summary: 'Update project column' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiBody({ type: UpdateProjectColumnDto })
  @ApiOkResponse({
    description: 'Column updated successfully',
    type: ProjectColumnResponseDto,
  })
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
  @ApiOperation({ summary: 'Create task in column' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiBody({ type: AddProjectTaskDto })
  @ApiOkResponse({
    description: 'Task created successfully',
    type: ProjectTaskResponseDto,
  })
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
  @ApiOperation({ summary: 'Get tasks from column' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiOkResponse({
    description: 'Cursor-paginated column tasks',
    type: ColumnTasksResponseDto,
  })
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
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({
    description: 'Task updated successfully',
    type: ProjectTaskResponseDto,
  })
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
  @ApiOperation({ summary: 'Update task status' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'columnId', description: 'Column ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiBody({ type: ChangeTaskStatusDto })
  @ApiOkResponse({
    description: 'Task status updated successfully',
    type: ProjectTaskResponseDto,
  })
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
  @ApiOperation({ summary: 'Create task comment' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiBody({ type: CreateProjectTaskCommentDto })
  @ApiCreatedResponse({
    description: 'Comment created successfully',
    type: ProjectTaskCommentResponseDto,
  })
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
  @ApiOperation({ summary: 'Get task comments' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiOkResponse({
    description: 'Paginated task comments tree',
    type: TaskCommentsResponseDto,
  })
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
