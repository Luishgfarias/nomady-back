import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { LikesRepository } from './likes.repository';
import { PostsService } from 'src/posts/posts.service';
import { LikePostDto } from './dto/like-post.dto';
import { FindLikedPostsDto } from './dto/find-liked-posts.dto';
import { NotFoundException } from '@nestjs/common';

describe('LikesService', () => {
  let likesService: LikesService;
  let likesRepository: LikesRepository;
  let postsService: PostsService;

  const likePostDto: LikePostDto = {
    userId: 'uuid-123',
    postId: 'uuid-456',
  };
  const expectPost = {
    author: {
      name: 'test',
      profilePhoto: 'test',
    },
    _count: {
      likes: 0,
    },
    id: 'uuid-456',
    title: 'test',
    content: 'test',
    published: true,
    createdAt: new Date(),
    authorId: 'uuid-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: LikesRepository,
          useValue: {
            likePost: jest.fn(),
            unlikePost: jest.fn(),
            findLikedPostsByUserId: jest.fn(),
          },
        },
        {
          provide: PostsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    likesService = module.get<LikesService>(LikesService);
    likesRepository = module.get<LikesRepository>(LikesRepository);
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(likesService).toBeDefined();
  });

  it('likesRepository should be defined', () => {
    expect(likesRepository).toBeDefined();
  });

  it('postsService should be defined', () => {
    expect(postsService).toBeDefined();
  });

  describe('like', () => {
    const findLikedPostsDto: FindLikedPostsDto = {
      userId: 'uuid-123',
      page: 1,
    };

    it('should like a post successfully', async () => {
      const expectedResult = {
        id: 'uuid-456',
        createdAt: new Date(),
        userId: 'uuid-123',
        postId: 'uuid-456',
      };

      jest.spyOn(postsService, 'findOne').mockResolvedValue(expectPost);
      jest.spyOn(likesRepository, 'likePost').mockResolvedValue(expectedResult);

      const result = await likesService.like(likePostDto);
      expect(result).toEqual(expectedResult);
      expect(postsService.findOne).toHaveBeenCalledWith(likePostDto.postId);
      expect(likesRepository.likePost).toHaveBeenCalledWith(likePostDto);
    });

    it('should throw error when post not found', async () => {
      jest
        .spyOn(postsService, 'findOne')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(likesService.like(likePostDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(postsService.findOne).toHaveBeenCalledWith(likePostDto.postId);
    });
  });

  describe('unlike', () => {
    it('should unlike a post successfully', async () => {
      const expectedResult = {
        count: expect.any(Number),
      };

      jest.spyOn(postsService, 'findOne').mockResolvedValue(expectPost);
      jest
        .spyOn(likesRepository, 'unlikePost')
        .mockResolvedValue(expectedResult);

      const result = await likesService.unlike(likePostDto);
      expect(result).toEqual(expectedResult);
      expect(postsService.findOne).toHaveBeenCalledWith(likePostDto.postId);
      expect(likesRepository.unlikePost).toHaveBeenCalledWith(likePostDto);
    });

    it('should throw error when post not found', async () => {
      jest
        .spyOn(postsService, 'findOne')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(likesService.unlike(likePostDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(postsService.findOne).toHaveBeenCalledWith(likePostDto.postId);
    });
  });

  describe('findLikedPostsByUserId', () => {
    it('should find liked posts successfully', async () => {
      const findLikedPostsDto: FindLikedPostsDto = {
        userId: 'uuid-123',
        page: 1,
      };
      const expectedPosts = {
        posts: [expectPost],
        total: 20,
      };
      const expectedResult = {
        posts: [expectPost],
        total: 20,
        totalPages: 2,
      };

      jest
        .spyOn(likesRepository, 'findLikedPostsByUserId')
        .mockResolvedValue(expectedPosts);

      const result =
        await likesService.findLikedPostsByUserId(findLikedPostsDto);
      expect(result).toEqual(expectedResult);
      expect(likesRepository.findLikedPostsByUserId).toHaveBeenCalledWith(
        findLikedPostsDto.userId,
        0,
      );
    });

    it('should calculate skip correctly', async () => {
      const findLikedPostsDto: FindLikedPostsDto = {
        userId: 'uuid-123',
        page: 2,
      };
      const expectedPosts = {
        posts: [expectPost],
        total: 20,
      };
      const expectedResult = {
        posts: [expectPost],
        total: 20,
        totalPages: 2,
      };

      jest
        .spyOn(likesRepository, 'findLikedPostsByUserId')
        .mockResolvedValue(expectedPosts);

      const result =
        await likesService.findLikedPostsByUserId(findLikedPostsDto);
      expect(result).toEqual(expectedResult);
      expect(likesRepository.findLikedPostsByUserId).toHaveBeenCalledWith(
        findLikedPostsDto.userId,
        10, // skip = (2-1) * 10 = 10
      );
    });

    it('should calculate total pages correctly', async () => {
      const findLikedPostsDto: FindLikedPostsDto = {
        userId: 'uuid-123',
        page: 1,
      };
      const expectedPosts = {
        posts: [expectPost],
        total: 20,
      };
      const expectedResult = {
        posts: [expectPost],
        total: 20,
        totalPages: 2, // Math.ceil(20 / 10) = 2
      };

      jest
        .spyOn(likesRepository, 'findLikedPostsByUserId')
        .mockResolvedValue(expectedPosts);

      const result =
        await likesService.findLikedPostsByUserId(findLikedPostsDto);
      expect(result).toEqual(expectedResult);
      expect(likesRepository.findLikedPostsByUserId).toHaveBeenCalledWith(
        findLikedPostsDto.userId,
        0,
      );
    });
  });
});
