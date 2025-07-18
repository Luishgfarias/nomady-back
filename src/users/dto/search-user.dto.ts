import { IsOptional, IsString } from 'class-validator';
import { paginationDto } from 'src/common/dtos/pagination.dto';

export class searchUserDto extends paginationDto {
  @IsString()
  @IsOptional()
  name: string;
}
