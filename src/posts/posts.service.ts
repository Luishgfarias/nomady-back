import { Injectable } from '@nestjs/common';
import { CreatePostRepositoryDto } from './dto/create-post-repository.dto';
import { UpdatePostRepositoryDto } from './dto/update-post-repository.dto';
import { PublishedPostDto } from './dto/published-post.dto';
import { PostsRepository } from './posts.repository';
import { FindPostsFollowingsDto } from './dto/find-posts-followings.dto';
import { paginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  create(createPostDto: CreatePostRepositoryDto) {
    return this.postsRepository.createPost(createPostDto);
  }

  async findAll({ page }: paginationDto) {
    const skip = (page - 1) * 10;
    const { posts, total } = await this.postsRepository.findAllPosts(skip);
    const totalPages = Math.ceil(total / 10);
    return {
      posts,
      total,
      totalPages,
    };
  }

  findOne(id: string) {
    return this.postsRepository.findPostById(id);
  }

  async archive(id: string, publishedPostDto: PublishedPostDto) {
    await this.postsRepository.findPostById(id);
    return this.postsRepository.archivePost(id, publishedPostDto.published);
  }

  async update(id: string, updatePostDto: Partial<UpdatePostRepositoryDto>) {
    await this.postsRepository.findPostById(id);
    return this.postsRepository.updatePost(id, updatePostDto);
  }

  async remove(id: string) {
    await this.postsRepository.findPostById(id);
    const result = await this.postsRepository.deletePost(id);
    if (result) {
      return { message: `Post with ID ${id} deleted successfully` };
    }
  }

  async findPostsFromFollowing(findPostsFollowingsDto: FindPostsFollowingsDto) {
    const skip = (findPostsFollowingsDto.page - 1) * 10;
    const { posts, total } = await this.postsRepository.findPostsFromFollowing(
      findPostsFollowingsDto.userId,
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
