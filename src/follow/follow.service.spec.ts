import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from './follow.service';
import { FollowRepository } from './follow.repository';
import { FollowUserDto } from './dto/follow-user.dto';
import { UsersService } from 'src/users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FindFollowUsersDto } from './dto/find-follow-users.dto';

describe('FollowService', () => {
  let followService: FollowService;
  let followRepository: FollowRepository;
  let usersService: UsersService;

  const userId1 = 'uuid1';
  const userId2 = 'uuid2';
  const followUserDto: FollowUserDto = {
    followingId: userId1,
    followerId: userId2,
  };
  const findFollowersByUserIdDto: FindFollowUsersDto = {
    userId: userId1,
    page: 1,
  };
  const expectedFollow = {
    id: 'uuid',
    followingId: userId1,
    followerId: userId2,
    createdAt: new Date(),
  };
  const expectedUser = {
    id: 'uuid',
    name: 'user test',
    email: 'user@test.com',
    profilePhoto: null,
    _count: {
      followers: 0,
      following: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        {
          provide: FollowRepository,
          useValue: {
            followUser: jest.fn(),
            unfollowUser: jest.fn(),
            findFollowersByUserId: jest.fn(),
            findFollowingByUserId: jest.fn(),
            findFollowByUserId: jest.fn(),
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

    followService = module.get<FollowService>(FollowService);
    followRepository = module.get<FollowRepository>(FollowRepository);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(followService).toBeDefined();
  });

  it('followRepository should be defined', () => {
    expect(followRepository).toBeDefined();
  });

  it('usersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('followUser', () => {
    it('should follow a user successfully', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(expectedUser);
      jest
        .spyOn(followRepository, 'findFollowByUserId')
        .mockResolvedValue(null);
      jest
        .spyOn(followRepository, 'followUser')
        .mockResolvedValue(expectedFollow);

      const result = await followService.followUser(followUserDto);
      expect(result).toEqual(expectedFollow);
      expect(usersService.findOne).toHaveBeenCalledWith(userId1);
      expect(followRepository.findFollowByUserId).toHaveBeenCalledWith(
        followUserDto,
      );
      expect(followRepository.followUser).toHaveBeenCalledWith(followUserDto);
    });

    it('should throw error when user not found', async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(followService.followUser(followUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(userId1);
      expect(followRepository.findFollowByUserId).not.toHaveBeenCalled();
      expect(followRepository.followUser).not.toHaveBeenCalled();
    });

    it('should throw error when trying to follow yourself', async () => {
      const followUserDto: FollowUserDto = {
        followingId: userId1,
        followerId: userId1,
      };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(expectedUser);

      await expect(followService.followUser(followUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(userId1);
      expect(followRepository.findFollowByUserId).not.toHaveBeenCalled();
      expect(followRepository.followUser).not.toHaveBeenCalled();
    });

    it('should throw error when already following', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(expectedUser);
      jest
        .spyOn(followRepository, 'findFollowByUserId')
        .mockResolvedValue(expectedFollow);

      await expect(followService.followUser(followUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(userId1);
      expect(followRepository.findFollowByUserId).toHaveBeenCalledWith(
        followUserDto,
      );
      expect(followRepository.followUser).not.toHaveBeenCalled();
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user successfully', async () => {
      const expectedResult = {
        message: 'User unfollowed successfully',
      };

      jest
        .spyOn(followRepository, 'findFollowByUserId')
        .mockResolvedValue(expectedFollow);
      jest
        .spyOn(followRepository, 'unfollowUser')
        .mockResolvedValue(expectedFollow);

      const result = await followService.unfollowUser(followUserDto);
      expect(result).toEqual(expectedResult);
      expect(followRepository.findFollowByUserId).toHaveBeenCalledWith(
        followUserDto,
      );
      expect(followRepository.unfollowUser).toHaveBeenCalledWith(followUserDto);
    });

    it('should throw error when not following', async () => {
      jest
        .spyOn(followRepository, 'findFollowByUserId')
        .mockResolvedValue(null);

      await expect(followService.unfollowUser(followUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(followRepository.findFollowByUserId).toHaveBeenCalledWith(
        followUserDto,
      );
      expect(followRepository.unfollowUser).not.toHaveBeenCalled();
    });
  });

  describe('findFollowersByUserId', () => {
    it('should return paginated followers', async () => {
      const expectedPaginatedUser = {
        users: [expectedUser],
        total: 1,
        totalPages: 1,
      };

      jest
        .spyOn(followRepository, 'findFollowersByUserId')
        .mockResolvedValue(expectedPaginatedUser);

      const result = await followService.findFollowersByUserId(
        findFollowersByUserIdDto,
      );
      expect(result).toEqual(expectedPaginatedUser);
      expect(followRepository.findFollowersByUserId).toHaveBeenCalledWith(
        findFollowersByUserIdDto.userId,
        0,
      );
    });

    it('should calculate correct skip for page', async () => {
      const findFollowersByUserIdDto: FindFollowUsersDto = {
        userId: userId1,
        page: 2,
      };
      const expectedPaginatedUser = {
        users: [expectedUser],
        total: 20,
        totalPages: 2,
      };

      jest
        .spyOn(followRepository, 'findFollowersByUserId')
        .mockResolvedValue(expectedPaginatedUser);

      const result = await followService.findFollowersByUserId(
        findFollowersByUserIdDto,
      );
      expect(result).toEqual(expectedPaginatedUser);
      expect(followRepository.findFollowersByUserId).toHaveBeenCalledWith(
        findFollowersByUserIdDto.userId,
        10, // (2 - 1) * 10 = 10
      );
    });

    it('should handle pagination correctly', async () => {
      const findFollowersByUserIdDto: FindFollowUsersDto = {
        userId: userId1,
        page: 3,
      };
      const expectedPaginatedUser = {
        users: [expectedUser],
        total: 25,
        totalPages: 3, // Math.ceil(25 / 10) = 3
      };

      jest
        .spyOn(followRepository, 'findFollowersByUserId')
        .mockResolvedValue(expectedPaginatedUser);

      const result = await followService.findFollowersByUserId(
        findFollowersByUserIdDto,
      );
      expect(result).toEqual(expectedPaginatedUser);
      expect(followRepository.findFollowersByUserId).toHaveBeenCalledWith(
        findFollowersByUserIdDto.userId,
        20,
      );
    });
  });

  describe('findFollowingByUserId', () => {
    it('should return paginated following users', async () => {
      const expectedPaginatedUser = {
        users: [expectedUser],
        total: 1,
        totalPages: 1,
      };

      jest
        .spyOn(followRepository, 'findFollowingByUserId')
        .mockResolvedValue(expectedPaginatedUser);

      const result = await followService.findFollowingByUserId(
        findFollowersByUserIdDto,
      );
      expect(result).toEqual(expectedPaginatedUser);
      expect(followRepository.findFollowingByUserId).toHaveBeenCalledWith(
        findFollowersByUserIdDto.userId,
        0,
      );
    });

    it('should calculate correct skip for page', async () => {
      const findFollowingByUserIdDto: FindFollowUsersDto = {
        userId: userId1,
        page: 2,
      };
      const expectedPaginatedUser = {
        users: [expectedUser],
        total: 20,
        totalPages: 2,
      };

      jest
        .spyOn(followRepository, 'findFollowingByUserId')
        .mockResolvedValue(expectedPaginatedUser);

      const result = await followService.findFollowingByUserId(
        findFollowingByUserIdDto,
      );
      expect(result).toEqual(expectedPaginatedUser);
      expect(followRepository.findFollowingByUserId).toHaveBeenCalledWith(
        findFollowingByUserIdDto.userId,
        10, // (2 - 1) * 10 = 10
      );
    });

    it('should handle pagination correctly', async () => {
      const findFollowingByUserIdDto: FindFollowUsersDto = {
        userId: userId1,
        page: 3,
      };
      const expectedPaginatedUser = {
        users: [expectedUser],
        total: 25,
        totalPages: 3, // Math.ceil(25 / 10) = 3
      };

      jest
        .spyOn(followRepository, 'findFollowingByUserId')
        .mockResolvedValue(expectedPaginatedUser);

      const result = await followService.findFollowingByUserId(
        findFollowingByUserIdDto,
      );
      expect(result).toEqual(expectedPaginatedUser);
      expect(followRepository.findFollowingByUserId).toHaveBeenCalledWith(
        findFollowingByUserIdDto.userId,
        20,
      );
    });
  });
});
