import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostRepositoryDto } from './dto/create-post-repository.dto';
import { UpdatePostRepositoryDto } from './dto/update-post-repository.dto';
import { FollowRepository } from 'src/follow/follow.repository';

@Injectable()
export class PostsRepository {
  constructor(
    private prisma: PrismaService,
    private followRepository: FollowRepository,
  ) {}
  private notFoundException = new NotFoundException('Post not found');

  createPost(data: CreatePostRepositoryDto) {
    try {
      return this.prisma.post.create({
        data,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  updatePost(id: string, data: Partial<UpdatePostRepositoryDto>) {
    try {
      return this.prisma.post.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  archivePost(id: string, published: boolean) {
    try {
      return this.prisma.post.update({
        where: { id },
        data: { published },
      });
    } catch (error) {
      console.error('Error archiving post:', error);
      throw error;
    }
  }

  deletePost(id: string) {
    try {
      return this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async findPostById(id: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id },
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
      });
      if (!post) {
        throw this.notFoundException;
      }
      return post;
    } catch (error) {
      console.error('Error finding post by ID:', error);
      throw error;
    }
  }

  //TO DO implement pagination and filtering
  findAllPosts() {
    try {
      return this.prisma.post.findMany({
        where: {
          published: true,
        },
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
      });
    } catch (error) {
      console.error('Error finding posts:', error);
      throw error;
    }
  }

  async findPostsFromFollowing(userId: string, skip: number) {
    try {
      const followingIds =
        await this.followRepository.findFollowingIdsByUserId(userId);

      const [posts, total] = await this.prisma.$transaction([
        this.prisma.post.findMany({
          where: {
            authorId: {
              in: followingIds,
            },
            published: true,
          },
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
          skip,
          take: 10,
        }),
        this.prisma.post.count({
          where: {
            authorId: {
              in: followingIds,
            },
            published: true,
          },
        }),
      ]);

      if (!posts || posts.length === 0) {
        throw this.notFoundException;
      }

      return {
        posts,
        total,
      };
    } catch (error) {
      console.error('Error finding posts from following:', error);
      throw error;
    }
  }
}
