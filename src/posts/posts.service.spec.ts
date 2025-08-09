import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { CreatePostRepositoryDto } from './dto/create-post-repository.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdatePostRepositoryDto } from './dto/update-post-repository.dto';
import { PublishedPostDto } from './dto/published-post.dto';
import { paginationDto } from 'src/common/dtos/pagination.dto';
import { FindPostsFollowingsDto } from './dto/find-posts-followings.dto';
import { UsersService } from 'src/users/users.service';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: PostsRepository;
  let usersService: UsersService;

  const expectedPost = {
    id: expect.any(String),
    title: 'Test Post',
    content: 'Test content',
    published: true,
    createdAt: expect.any(Date),
    authorId: expect.any(String),
    _count: {
      likes: 0,
    },
    author: {
      name: 'Test User',
      profilePhoto: null,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: {
            createPost: jest.fn(),
            findAllPosts: jest.fn(),
            findPostById: jest.fn(),
            archivePost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            findPostsFromFollowing: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsRepository = module.get<PostsRepository>(PostsRepository);
    usersService = module.get<UsersService>(UsersService);
  });

  it('PostsService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PostsRepository should be defined', () => {
    expect(postsRepository).toBeDefined();
  });

  it('UsersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostRepositoryDto = {
        title: 'Test Post',
        content: 'Test Content',
        authorId: '123',
      };

      jest.spyOn(postsRepository, 'createPost').mockResolvedValue(expectedPost);

      const result = await service.create(createPostDto);

      expect(result).toEqual(expectedPost);
      expect(postsRepository.createPost).toHaveBeenCalledWith(createPostDto);
    });

    it('should throw an error if the post is not created', async () => {
      const createPostDto: CreatePostRepositoryDto = {
        title: 'Test Post',
        content: 'Test Content',
        authorId: '123',
      };

      jest
        .spyOn(postsRepository, 'createPost')
        .mockRejectedValue(new Error('Error creating post'));

      await expect(service.create(createPostDto)).rejects.toThrow(Error);
      expect(postsRepository.createPost).toHaveBeenCalledWith(createPostDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const paginationDto: paginationDto = { page: 1 };
      const repositoryResponse = {
        posts: [expectedPost],
        total: 1,
      };
      const expectedResponse = {
        posts: [expectedPost],
        total: 1,
        totalPages: 1,
      };

      jest
        .spyOn(postsRepository, 'findAllPosts')
        .mockResolvedValue(repositoryResponse);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual(expectedResponse);
      expect(postsRepository.findAllPosts).toHaveBeenCalledWith(0); // skip = (1-1) * 10 = 0
    });

    it('should calculate correct skip for page 2', async () => {
      const paginationDto: paginationDto = { page: 2 };
      const repositoryResponse = {
        posts: [expectedPost],
        total: 15,
      };
      const expectedResponse = {
        posts: [expectedPost],
        total: 15,
        totalPages: 2,
      };

      jest
        .spyOn(postsRepository, 'findAllPosts')
        .mockResolvedValue(repositoryResponse);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual(expectedResponse);
      expect(postsRepository.findAllPosts).toHaveBeenCalledWith(10); // skip = (2-1) * 10 = 10
    });

    it('should calculate correct totalPages', async () => {
      const paginationDto: paginationDto = { page: 1 };
      const repositoryResponse = {
        posts: [expectedPost],
        total: 25,
      };
      const expectedResponse = {
        posts: [expectedPost],
        total: 25,
        totalPages: 3, // Math.ceil(25 / 10) = 3
      };

      jest
        .spyOn(postsRepository, 'findAllPosts')
        .mockResolvedValue(repositoryResponse);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual(expectedResponse);
      expect(postsRepository.findAllPosts).toHaveBeenCalledWith(0);
    });

    it('should throw an error if the posts are not found', async () => {
      const paginationDto: paginationDto = { page: 1 };

      jest
        .spyOn(postsRepository, 'findAllPosts')
        .mockRejectedValue(new NotFoundException('Posts not found'));

      await expect(service.findAll(paginationDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(postsRepository.findAllPosts).toHaveBeenCalledWith(0);
    });
  });

  describe('findOne', () => {
    it('should return a post', async () => {
      jest
        .spyOn(postsRepository, 'findPostById')
        .mockResolvedValue(expectedPost);

      const result = await service.findOne('123');
      expect(result).toEqual(expectedPost);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
    });

    it('should throw an error if the post is not found', async () => {
      jest
        .spyOn(postsRepository, 'findPostById')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
    });
  });

  describe('archive', () => {
    it('should archive a post', async () => {
      const publishedPostDto: PublishedPostDto = {
        published: false,
      };

      jest.spyOn(postsRepository, 'findPostById').mockResolvedValue(expectedPost);
      jest
        .spyOn(postsRepository, 'archivePost')
        .mockResolvedValue(expectedPost);

      const result = await service.archive('123', publishedPostDto);
      expect(result).toEqual(expectedPost);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
      expect(postsRepository.archivePost).toHaveBeenCalledWith(
        '123',
        publishedPostDto.published,
      );
    });

    it('should throw an error if the post is not found', async () => {
      jest
        .spyOn(postsRepository, 'findPostById')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(
        service.archive('123', { published: false }),
      ).rejects.toThrow(NotFoundException);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto: Partial<UpdatePostRepositoryDto> = {
        title: 'Updated Post',
        content: 'Updated Content',
      };

      jest.spyOn(postsRepository, 'findPostById').mockResolvedValue(expectedPost);
      jest.spyOn(postsRepository, 'updatePost').mockResolvedValue(expectedPost);

      const result = await service.update('123', updatePostDto);
      expect(result).toEqual(expectedPost);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
      expect(postsRepository.updatePost).toHaveBeenCalledWith(
        '123',
        updatePostDto,
      );
    });

    it('should throw an error if the post is not found', async () => {
      const updatePostDto: Partial<UpdatePostRepositoryDto> = {
        title: 'Updated Post',
        content: 'Updated Content',
      };
      jest
        .spyOn(postsRepository, 'findPostById')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(service.update('123', updatePostDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const mockReturnValue = {
        message: 'Post with ID 123 deleted successfully',
      };

      jest.spyOn(postsRepository, 'findPostById').mockResolvedValue(expectedPost);
      jest.spyOn(postsRepository, 'deletePost').mockResolvedValue(expectedPost);

      const result = await service.remove('123');
      expect(result).toEqual(mockReturnValue);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
      expect(postsRepository.deletePost).toHaveBeenCalledWith('123');
    });

    it('should throw an error if the post is not found', async () => {
      jest
        .spyOn(postsRepository, 'findPostById')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(service.remove('123')).rejects.toThrow(NotFoundException);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
    });
  });

  describe('findPostsFromFollowing', () => {
    const mockUser = {
      _count: {
        followers: 0,
        following: 0,
      },
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      profilePhoto: null,
    };
    it('should return posts from following', async () => {
      const findPostsFollowingsDto: FindPostsFollowingsDto = {
        userId: '123',
        page: 1,
      };
      const repositoryResponse = {
        posts: [expectedPost],
        total: 1,
      };
      const expectedResponse = {
        posts: [expectedPost],
        total: 1,
        totalPages: 1,
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(postsRepository, 'findPostsFromFollowing')
        .mockResolvedValue(repositoryResponse);

      const result = await service.findPostsFromFollowing(
        findPostsFollowingsDto,
      );
      expect(result).toEqual(expectedResponse);
      expect(usersService.findOne).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
      );
      expect(postsRepository.findPostsFromFollowing).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
        0,
      );
    });

    it('should calculate correct skip for page 2', async () => {
      const findPostsFollowingsDto: FindPostsFollowingsDto = {
        userId: '123',
        page: 2,
      };
      const repositoryResponse = {
        posts: [expectedPost],
        total: 15,
      };
      const expectedResponse = {
        posts: [expectedPost],
        total: 15,
        totalPages: 2,
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(postsRepository, 'findPostsFromFollowing')
        .mockResolvedValue(repositoryResponse);

      const result = await service.findPostsFromFollowing(
        findPostsFollowingsDto,
      );
      expect(result).toEqual(expectedResponse);
      expect(usersService.findOne).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
      );
      expect(postsRepository.findPostsFromFollowing).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
        10, // skip = (2-1) * 10 = 10
      );
    });

    it('should calculate correct totalPages', async () => {
      const findPostsFollowingsDto: FindPostsFollowingsDto = {
        userId: '123',
        page: 1,
      };
      const repositoryResponse = {
        posts: [expectedPost],
        total: 25,
      };
      const expectedResponse = {
        posts: [expectedPost],
        total: 25,
        totalPages: 3, // Math.ceil(25 / 10) = 3
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(postsRepository, 'findPostsFromFollowing')
        .mockResolvedValue(repositoryResponse);

      const result = await service.findPostsFromFollowing(
        findPostsFollowingsDto,
      );
      expect(result).toEqual(expectedResponse);
      expect(usersService.findOne).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
      );
      expect(postsRepository.findPostsFromFollowing).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
        0,
      );
    });

    it('should throw an error if the posts are not found', async () => {
      const findPostsFollowingsDto: FindPostsFollowingsDto = {
        userId: '123',
        page: 1,
      };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(postsRepository, 'findPostsFromFollowing')
        .mockRejectedValue(new NotFoundException('Posts not found'));

      await expect(
        service.findPostsFromFollowing(findPostsFollowingsDto),
      ).rejects.toThrow(NotFoundException);
      expect(usersService.findOne).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
      );
      expect(postsRepository.findPostsFromFollowing).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
        0,
      );
    });

    it('should throw an error if the user is not found', async () => {
      const findPostsFollowingsDto: FindPostsFollowingsDto = {
        userId: '123',
        page: 1,
      };

      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        service.findPostsFromFollowing(findPostsFollowingsDto),
      ).rejects.toThrow(NotFoundException);
      expect(usersService.findOne).toHaveBeenCalledWith(
        findPostsFollowingsDto.userId,
      );
    });
  });
});
