import { IsUUID } from 'class-validator';

export class FollowUserDto {
  @IsUUID()
  followingId: string;

  @IsUUID()
  followerId: string;
}
