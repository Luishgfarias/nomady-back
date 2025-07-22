import { IsBoolean } from 'class-validator';

export class PublishedPostDto {
  @IsBoolean()
  published: boolean;
}
