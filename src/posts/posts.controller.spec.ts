import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { LikesService } from 'src/likes/likes.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfigs from 'src/auth/configs/jwt.configs';
import { UsersService } from 'src/users/users.service';
import { CreatePostRepositoryDto } from './dto/create-post-repository.dto';
import { CreatePostControllerDto } from './dto/create-post-controller.dto';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';
import { paginationDto } from 'src/common/dtos/pagination.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePostRepositoryDto } from './dto/update-post-repository.dto';
import { uuidDto } from 'src/common/dtos/uuid.dto';
import { PublishedPostDto } from './dto/published-post.dto';
import { FindPostsFollowingsDto } from './dto/find-posts-followings.dto';

describe('PostsController', () => {
  let postController: PostsController;
  let postService: PostsService;
  let likesService: LikesService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const userTokenDto: UserTokenDto = {
    sub: '123',
    email: 'test@test.com',
    iat: 1,
    exp: 1,
    aud: 'test',
    iss: 'test',
  };
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
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            archive: jest.fn(),
            remove: jest.fn(),
            findPostsFromFollowing: jest.fn(),
          },
        },
        {
          provide: LikesService,
          useValue: {
            like: jest.fn(),
            unlike: jest.fn(),
            findLikedPostsByUserId: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: jwtConfigs.KEY,
          useValue: {
            secret: 'test-secret',
            audience: 'test-audience',
            issuer: 'test-issuer',
            expiresIn: 3600,
            refreshExpiresIn: 86400,
          },
        },
      ],
    }).compile();

    postController = module.get<PostsController>(PostsController);
    postService = module.get<PostsService>(PostsService);
    likesService = module.get<LikesService>(LikesService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(postController).toBeDefined();
  });

  it('PostsService should be defined', () => {
    expect(postService).toBeDefined();
  });

  it('LikesService should be defined', () => {
    expect(likesService).toBeDefined();
  });

  it('JwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('UsersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    const createPostDto: CreatePostControllerDto = {
      title: 'Test Post',
      content: 'Test Content',
    };
    it('should create a post', async () => {
      jest.spyOn(postService, 'create').mockResolvedValue(expectedPost);

      const result = await postController.create(userTokenDto, createPostDto);
      expect(result).toEqual(expectedPost);
      expect(postService.create).toHaveBeenCalledWith({
        ...createPostDto,
        authorId: userTokenDto.sub,
      });
    });

    it('should throw an error if the post is not created', async () => {
      jest
        .spyOn(postService, 'create')
        .mockRejectedValue(new Error('Error creating post'));

      await expect(
        postController.create(userTokenDto, createPostDto),
      ).rejects.toThrow(Error);
      expect(postService.create).toHaveBeenCalledWith({
        ...createPostDto,
        authorId: userTokenDto.sub,
      });
    });
  });

  describe('findAll', () => {
    const paginationDto: paginationDto = { page: 1 };
    const expectedResponse = {
      posts: [expectedPost],
      total: 1,
      totalPages: 1,
    };

    it('should return paginated posts', async () => {
      jest.spyOn(postService, 'findAll').mockResolvedValue(expectedResponse);

      const result = await postController.findAll(paginationDto);
      expect(result).toEqual(expectedResponse);
      expect(postService.findAll).toHaveBeenCalledWith(paginationDto);
    });

    it('should return paginated posts with default page', async () => {
      const emptyQuery = {} as any;

      jest.spyOn(postService, 'findAll').mockResolvedValue(expectedResponse);

      const result = await postController.findAll(emptyQuery);
      expect(result).toEqual(expectedResponse);
      expect(postService.findAll).toHaveBeenCalledWith({ page: 1 });
    });

    it('should throw an error if the posts are not found', async () => {
      jest
        .spyOn(postService, 'findAll')
        .mockRejectedValue(new NotFoundException('Posts not found'));

      await expect(postController.findAll(paginationDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(postService.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('findOne', () => {
    it('should return a post', async () => {
      jest.spyOn(postService, 'findOne').mockResolvedValue(expectedPost);

      const result = await postController.findOne({ id: '123' });
      expect(result).toEqual(expectedPost);
      expect(postService.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw an error if the post is not found', async () => {
      jest
        .spyOn(postService, 'findOne')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(postController.findOne({ id: '123' })).rejects.toThrow(
        NotFoundException,
      );
      expect(postService.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('update', () => {
    const updatePostDto: Partial<UpdatePostRepositoryDto> = {
      title: 'Updated Post',
      content: 'Updated Content',
    };
    const uuidDto: uuidDto = { id: '123' };
    it('should update a post', async () => {
      jest.spyOn(postService, 'update').mockResolvedValue(expectedPost);

      const result = await postController.update(uuidDto, updatePostDto);
      expect(result).toEqual(expectedPost);
      expect(postService.update).toHaveBeenCalledWith('123', updatePostDto);
    });

    it('should throw an error if the post is not found', async () => {
      jest
        .spyOn(postService, 'update')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(
        postController.update(uuidDto, updatePostDto),
      ).rejects.toThrow(NotFoundException);
      expect(postService.update).toHaveBeenCalledWith('123', updatePostDto);
    });
  });

  describe('archive', () => {
    const uuidDto: uuidDto = { id: '123' };
    const publishedPostDto: PublishedPostDto = { published: false };

    it('should archive a post', async () => {
      jest.spyOn(postService, 'archive').mockResolvedValue(expectedPost);

      const result = await postController.archive(uuidDto, publishedPostDto);
      expect(result).toEqual(expectedPost);
      expect(postService.archive).toHaveBeenCalledWith('123', publishedPostDto);
    });

    it('should throw an error if the post is not found', async () => {
      jest
        .spyOn(postService, 'archive')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(
        postController.archive(uuidDto, publishedPostDto),
      ).rejects.toThrow(NotFoundException);
      expect(postService.archive).toHaveBeenCalledWith('123', publishedPostDto);
    });
  });

  describe('remove', () => {
    const uuidDto: uuidDto = { id: '123' };
    it('should remove a post', async () => {
      const expectedResponse = {
        message: `Post with ID 123 deleted successfully`,
      };

      jest.spyOn(postService, 'remove').mockResolvedValue(expectedResponse);

      const result = await postController.remove(uuidDto);
      expect(result).toEqual(expectedResponse);
      expect(postService.remove).toHaveBeenCalledWith('123');
    });

    it('should throw an error if the post is not deleted', async () => {
      jest
        .spyOn(postService, 'remove')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(postController.remove(uuidDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(postService.remove).toHaveBeenCalledWith('123');
    });
  });

  describe('findPostsFromFollowing', () => {
    const paginationDto: paginationDto = { page: 1 };
    const expectedResponse = {
      posts: [expectedPost],
      total: 1,
      totalPages: 1,
    };
    it('should return posts from following', async () => {
      jest
        .spyOn(postService, 'findPostsFromFollowing')
        .mockResolvedValue(expectedResponse);

      const result = await postController.findPostsFromFollowing(
        userTokenDto,
        paginationDto,
      );
      expect(result).toEqual(expectedResponse);
      expect(postService.findPostsFromFollowing).toHaveBeenCalledWith({
        userId: '123',
        page: 1,
      });
    });

    it('should return posts from following with default page', async () => {
      const emptyQuery = {} as any;

      jest
        .spyOn(postService, 'findPostsFromFollowing')
        .mockResolvedValue(expectedResponse);

      const result = await postController.findPostsFromFollowing(
        userTokenDto,
        emptyQuery,
      );
      expect(result).toEqual(expectedResponse);
      expect(postService.findPostsFromFollowing).toHaveBeenCalledWith({
        userId: '123',
        page: 1,
      });
    });

    it('should throw an error if the posts are not found', async () => {
      jest
        .spyOn(postService, 'findPostsFromFollowing')
        .mockRejectedValue(new NotFoundException('Posts not found'));

      await expect(
        postController.findPostsFromFollowing(userTokenDto, paginationDto),
      ).rejects.toThrow(NotFoundException);
      expect(postService.findPostsFromFollowing).toHaveBeenCalledWith({
        userId: '123',
        page: 1,
      });
    });
  });

  describe('findLikedPosts', () => {
    const paginationDto: paginationDto = { page: 1 };
    const expectedResponse = {
      posts: [expectedPost],
      total: 1,
      totalPages: 1,
    };
    it('should return liked posts', async () => {
      jest
        .spyOn(likesService, 'findLikedPostsByUserId')
        .mockResolvedValue(expectedResponse);

      const result = await postController.findLikedPosts(
        userTokenDto,
        paginationDto,
      );
      expect(result).toEqual(expectedResponse);
      expect(likesService.findLikedPostsByUserId).toHaveBeenCalledWith({
        userId: '123',
        page: 1,
      });
    });

    it('should return liked posts with default page', async () => {
      const emptyQuery = {} as any;

      jest
        .spyOn(likesService, 'findLikedPostsByUserId')
        .mockResolvedValue(expectedResponse);

      const result = await postController.findLikedPosts(
        userTokenDto,
        emptyQuery,
      );
      expect(result).toEqual(expectedResponse);
      expect(likesService.findLikedPostsByUserId).toHaveBeenCalledWith({
        userId: '123',
        page: 1,
      });
    });

    it('should throw an error if the posts are not found', async () => {
      jest
        .spyOn(likesService, 'findLikedPostsByUserId')
        .mockRejectedValue(new NotFoundException('Posts not found'));

      await expect(
        postController.findLikedPosts(userTokenDto, paginationDto),
      ).rejects.toThrow(NotFoundException);
      expect(likesService.findLikedPostsByUserId).toHaveBeenCalledWith({
        userId: '123',
        page: 1,
      });
    });
  });

  describe('like', () => {
    const uuidDto: uuidDto = { id: '123' };
    const expectedResponse = {
      id: '123',
      createdAt: expect.any(Date),
      userId: '123',
      postId: '123',
    };
    it('should like a post', async () => {
      jest.spyOn(likesService, 'like').mockResolvedValue(expectedResponse);

      const result = await postController.likePost(uuidDto, userTokenDto);
      expect(result).toEqual(expectedResponse);
      expect(likesService.like).toHaveBeenCalledWith({
        postId: '123',
        userId: '123',
      });
    });

    it('should throw an error if the post is not liked', async () => {
      jest
        .spyOn(likesService, 'like')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(
        postController.likePost(uuidDto, userTokenDto),
      ).rejects.toThrow(NotFoundException);
      expect(likesService.like).toHaveBeenCalledWith({
        postId: '123',
        userId: '123',
      });
    });
  });

  describe('unlike', () => {
    const uuidDto: uuidDto = { id: '123' };
    const expectedResponse = {
      count: 1,
    };
    it('should unlike a post', async () => {
      jest.spyOn(likesService, 'unlike').mockResolvedValue(expectedResponse);

      const result = await postController.unlikePost(uuidDto, userTokenDto);
      expect(result).toEqual(expectedResponse);
      expect(likesService.unlike).toHaveBeenCalledWith({
        postId: '123',
        userId: '123',
      });
    });

    it('should throw an error if the post is not unliked', async () => {
      jest
        .spyOn(likesService, 'unlike')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(
        postController.unlikePost(uuidDto, userTokenDto),
      ).rejects.toThrow(NotFoundException);
      expect(likesService.unlike).toHaveBeenCalledWith({
        postId: '123',
        userId: '123',
      });
    });
  });
});
