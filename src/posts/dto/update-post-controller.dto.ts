import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreatePostControllerDto } from './create-post-controller.dto';
import { PublishedPostDto } from './published-post.dto';

export class UpdatePostControllerDto extends PartialType(
  IntersectionType(CreatePostControllerDto, PublishedPostDto),
) {}
