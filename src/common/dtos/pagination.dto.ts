import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class paginationDto {
  @ApiProperty({
    description: 'Número da página',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page: number;
}
