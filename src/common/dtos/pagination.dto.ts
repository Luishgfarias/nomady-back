import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class paginationDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page: number;
}
