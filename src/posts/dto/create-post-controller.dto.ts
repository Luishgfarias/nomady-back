import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePostControllerDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  content: string;
}
