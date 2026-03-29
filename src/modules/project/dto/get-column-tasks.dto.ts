import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { CursorPaginationDto } from '../../../infrastracture/dto/cursor-pagination.dto';
import { TaskStatus } from '../schemas/project-task.schema';

export class GetColumnTasksDto extends CursorPaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) {
      return [TaskStatus.ACTIVE];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }

    return [TaskStatus.ACTIVE];
  })
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  statuses?: TaskStatus[] = [TaskStatus.ACTIVE];
}
