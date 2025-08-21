import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FollowRepository } from './follow.repository';
import { FollowUserDto } from './dto/follow-user.dto';
import { FindFollowUsersDto } from './dto/find-follow-users.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FollowService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly usersService: UsersService,
  ) {}

  async followUser(followUserDto: FollowUserDto) {
    try {
      const { followingId, followerId } = followUserDto;

      await this.usersService.findOne(followingId);

      if (followingId === followerId) {
        throw new BadRequestException('You cannot follow yourself');
      }

      const follow =
        await this.followRepository.findFollowByUserId(followUserDto);

      if (follow) {
        throw new BadRequestException('You are already following this user');
      }

      return this.followRepository.followUser(followUserDto);
    } catch (error) {
      throw error;
    }
  }

  async unfollowUser(followUserDto: FollowUserDto) {
    try {
      const follow =
        await this.followRepository.findFollowByUserId(followUserDto);

      if (!follow) {
        throw new NotFoundException('You are not following this user');
      }

      await this.followRepository.unfollowUser(followUserDto);

      return {
        message: 'User unfollowed successfully',
      };
    } catch (error) {
      throw error;
    }
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
