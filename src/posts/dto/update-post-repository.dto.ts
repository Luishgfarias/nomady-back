import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreatePostRepositoryDto } from './create-post-repository.dto';
import { PublishedPostDto } from './published-post.dto';

export class UpdatePostRepositoryDto extends PartialType(
  IntersectionType(CreatePostRepositoryDto, PublishedPostDto),
) {}
