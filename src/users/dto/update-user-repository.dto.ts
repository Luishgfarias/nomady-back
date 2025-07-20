import { PartialType } from '@nestjs/mapped-types';
import { CreateUserRepositoryDto } from './create-user-repository.dto';

export class UpdateUserRepositoryDto extends PartialType(
  CreateUserRepositoryDto,
) {
  profilePhoto: string;
}
