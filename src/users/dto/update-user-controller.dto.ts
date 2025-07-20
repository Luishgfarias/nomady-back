import { PartialType } from '@nestjs/mapped-types';
import { CreateUserControllerDto } from './create-user-controller.dto';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserControllerDto extends PartialType(
  CreateUserControllerDto,
) {
  @IsOptional()
  @IsString()
  @IsUrl()
  profilePhoto: string;
}
