import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FollowUserDto } from './dto/follow-user.dto';

@Injectable()
export class FollowRepository {
  constructor(private prisma: PrismaService) {}

  followUser(data: FollowUserDto) {
    try {
      return this.prisma.follow.create({
        data,
      });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  unfollowUser(data: FollowUserDto) {
    try {
      return this.prisma.follow.delete({
        where: {
          followerId_followingId: data,
        },
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async findFollowersByUserId(userId: string, skip: number) {
    try {
      const [follows, total] = await this.prisma.$transaction([
        this.prisma.follow.findMany({
          where: {
            followingId: userId,
          },
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
              },
            },
          },
          skip,
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.follow.count({
          where: {
            followingId: userId,
          },
        }),
      ]);

      return {
        users: follows.map((follow) => follow.follower),
        total,
      };
    } catch (error) {
      console.error('Error finding followers by user ID:', error);
      throw error;
    }
  }

  async findFollowingByUserId(userId: string, skip: number) {
    try {
      const [follows, total] = await this.prisma.$transaction([
        this.prisma.follow.findMany({
          where: {
            followerId: userId,
          },
          select: {
            following: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
              },
            },
          },
          skip,
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.follow.count({
          where: {
            followerId: userId,
          },
        }),
      ]);

      return {
        users: follows.map((follow) => follow.following),
        total,
      };
    } catch (error) {
      console.error('Error finding following by user ID:', error);
      throw error;
    }
  }

  async findFollowingIdsByUserId(userId: string): Promise<string[]> {
    try {
      const data = await this.prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        select: {
          followingId: true,
        },
      });

      return data.map((follow) => follow.followingId);
    } catch (error) {
      console.error('Error finding following IDs by user ID:', error);
      throw error;
    }
  }

  findFollowByUserId(data: FollowUserDto) {
    try {
      return this.prisma.follow.findUnique({
        where: {
          followerId_followingId: data,
        },
      });
    } catch (error) {
      console.error('Error finding follow by user ID:', error);
      throw error;
    }
  }
}
