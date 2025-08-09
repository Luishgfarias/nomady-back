import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FollowRepository } from './follow.repository';
import { FollowUserDto } from './dto/follow-user.dto';
import { FindFollowUsersDto } from './dto/find-follow-users.dto';

@Injectable()
export class FollowService {
  constructor(private readonly followRepository: FollowRepository) {}

  async followUser(followUserDto: FollowUserDto) {
    const { followingId, followerId } = followUserDto;

    if (followingId === followerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const follow =
      await this.followRepository.findFollowByUserId(followUserDto);

    if (follow) {
      throw new BadRequestException('You are already following this user');
    }

    return this.followRepository.followUser(followUserDto);
  }

  async unfollowUser(followUserDto: FollowUserDto) {
    const follow =
      await this.followRepository.findFollowByUserId(followUserDto);

    if (!follow) {
      throw new NotFoundException('You are not following this user');
    }

    return this.followRepository.unfollowUser(followUserDto);
  }

  async findFollowersByUserId({ userId, page }: FindFollowUsersDto) {
    const skip = (page - 1) * 10;
    const { users, total } = await this.followRepository.findFollowersByUserId(
      userId,
      skip,
    );
    const totalPages = Math.ceil(total / 10);
    return {
      users,
      total,
      totalPages,
    };
  }

  async findFollowingByUserId({ userId, page }: FindFollowUsersDto) {
    const skip = (page - 1) * 10;
    const { users, total } = await this.followRepository.findFollowingByUserId(
      userId,
      skip,
    );
    const totalPages = Math.ceil(total / 10);
    return {
      users,
      total,
      totalPages,
    };
  }
}
