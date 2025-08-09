import { PrismaService } from 'src/prisma/prisma.service';
import { LikePostDto } from './dto/like-post.dto';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class LikesRepository {
  constructor(private prisma: PrismaService) {}

  async likePost(data: LikePostDto) {
    try {
      return await this.prisma.like.create({
        data,
      });
    } catch (error) {
      console.error('Error liking post:', error);
      if (error.code === 'P2002') {
        throw new BadRequestException('Post already liked');
      }
      throw error;
    }
  }

  async unlikePost({ postId, userId }: LikePostDto) {
    try {
      return await this.prisma.like.deleteMany({
        where: { postId, userId },
      });
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }
  
  async findLikedPostsByUserId(userId: string, skip: number) {
    try {
      const [likes, total] = await this.prisma.$transaction([
        this.prisma.like.findMany({
          where: {
            userId,
            post: {
              published: true,
            },
          },
          select: {
            post: {
              include: {
                _count: {
                  select: { likes: true },
                },
                author: {
                  select: {
                    name: true,
                    profilePhoto: true,
                  },
                },
              },
            },
          },
          skip,
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.like.count({
          where: {
            userId,
            post: {
              published: true,
            },
          },
        }),
      ]);

      return {
        posts: likes.map(like => like.post),
        total,
      };
    } catch (error) {
      console.error('Error finding likes by user ID:', error);
      throw error;
    }
  }
}
