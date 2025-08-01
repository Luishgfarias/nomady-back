import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FollowRepository } from './follow.repository';
import { FollowUserDto } from './dto/follow-user.dto';

@Injectable()
export class FollowService {
  constructor(private readonly followRepository: FollowRepository) {}

  async followUser(followUserDto: FollowUserDto) {
    const { followingId, followerId } = followUserDto;

    if (followingId === followerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const follow = await this.followRepository.findFollowByUserId(followUserDto);

    if (follow) {
      throw new BadRequestException('You are already following this user');
    }

    return this.followRepository.followUser(followUserDto);
  }

  async unfollowUser(followUserDto: FollowUserDto) {
    const follow = await this.followRepository.findFollowByUserId(followUserDto);

    if (!follow) {
      throw new NotFoundException('You are not following this user');
    }

    return this.followRepository.unfollowUser(followUserDto);
  }

  findFollowersByUserId(userId: string) {
    return this.followRepository.findFollowersByUserId(userId);
  }

  findFollowingByUserId(userId: string) {
    return this.followRepository.findFollowingByUserId(userId);
  }
}
