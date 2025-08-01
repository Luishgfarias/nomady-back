import { paginationDto } from 'src/common/dtos/pagination.dto';
import { IsUUID } from 'class-validator';

export class FindPostsFollowingsDto extends paginationDto {
  @IsUUID()
  userId: string;
}
