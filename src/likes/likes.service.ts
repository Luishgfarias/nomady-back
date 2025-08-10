import { Injectable } from '@nestjs/common';
import { LikePostDto } from './dto/like-post.dto';
import { LikesRepository } from './likes.repository';
import { PostsService } from 'src/posts/posts.service';
import { FindLikedPostsDto } from './dto/find-liked-posts.dto';

@Injectable()
export class LikesService {
  constructor(
    private likesRepository: LikesRepository,
    private postsService: PostsService,
  ) {}

  async like(data: LikePostDto) {
    try {
      await this.postsService.findOne(data.postId);
      return await this.likesRepository.likePost(data);
    } catch (error) {
      throw error;
    }
  }

  async unlike(data: LikePostDto) {
    try {
      await this.postsService.findOne(data.postId);
      return await this.likesRepository.unlikePost(data);
    } catch (error) {
      throw error;
    }
  }

  async findLikedPostsByUserId({ page, userId }: FindLikedPostsDto) {
    const skip = (page - 1) * 10;
    const { posts, total } = await this.likesRepository.findLikedPostsByUserId(
      userId,
      skip,
    );
    const totalPages = Math.ceil(total / 10);
    return {
      posts,
      total,
      totalPages,
    };
  }
}
