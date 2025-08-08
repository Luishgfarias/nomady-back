import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { CreatePostRepositoryDto } from './dto/create-post-repository.dto';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: PostsRepository;

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
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsRepository = module.get<PostsRepository>(PostsRepository);
  });

  it('PostsService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PostsRepository should be defined', () => {
    expect(postsRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostRepositoryDto = {
        title: 'Test Post',
        content: 'Test Content',
        authorId: '123',
      };
      const expectedPost = {
        id: '123',
        title: 'Test Post',
        content: 'Test Content',
        published: true,
        createdAt: expect.any(Date),
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
    it('should return all posts', async () => {
      const expectedPosts = [expectedPost];

      jest
        .spyOn(postsRepository, 'findAllPosts')
        .mockResolvedValue(expectedPosts);

      const result = await service.findAll();
      expect(result).toEqual(expectedPosts);
      expect(postsRepository.findAllPosts).toHaveBeenCalled();
    });

    it('should throw an error if the posts are not found', async () => {
      jest
        .spyOn(postsRepository, 'findAllPosts')
        .mockRejectedValue(new Error('Error finding posts'));

      await expect(service.findAll()).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return a post', async () => {

      jest.spyOn(postsRepository, 'findPostById').mockResolvedValue(expectedPost);

      const result = await service.findOne('123');
      expect(result).toEqual(expectedPost);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
    });

    it('should throw an error if the post is not found', async () => {
      jest
        .spyOn(postsRepository, 'findPostById')
        .mockRejectedValue(new Error('Error finding post'));

      await expect(service.findOne('123')).rejects.toThrow(Error);
      expect(postsRepository.findPostById).toHaveBeenCalledWith('123');
    });
  });
});
