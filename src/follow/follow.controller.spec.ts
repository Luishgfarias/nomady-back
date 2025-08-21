import { Test, TestingModule } from '@nestjs/testing';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { FollowUserDto } from './dto/follow-user.dto';
import { paginationDto } from '../common/dtos/pagination.dto';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfigs from 'src/auth/configs/jwt.configs';
import { uuidDto } from 'src/common/dtos/uuid.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FollowController', () => {
  let followController: FollowController;
  let followService: FollowService;
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
  const followingUserId = 'followinguserid';
  const followerUserId = 'followeruserid';
  const expectedFollow = {
    id: 'uuid',
    followingId: followingUserId,
    followerId: followerUserId,
    createdAt: new Date(),
  };
  const uuidDto: uuidDto = { id: 'uuid' };
  const expectedUser = {
    id: 'uuid-123',
    name: 'test',
    email: 'test@test.com',
    profilePhoto: 'profile-photo-url',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      followers: 0,
      following: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [
        {
          provide: FollowService,
          useValue: {
            followUser: jest.fn(),
            unfollowUser: jest.fn(),
            findFollowersByUserId: jest.fn(),
            findFollowingByUserId: jest.fn(),
            checkIfUserFollows: jest.fn(),
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

    followController = module.get<FollowController>(FollowController);
    followService = module.get<FollowService>(FollowService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(followController).toBeDefined();
  });
  it('FollowService should be defined', () => {
    expect(followService).toBeDefined();
  });
  it('UsersService should be defined', () => {
    expect(usersService).toBeDefined();
  });
  it('JwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('followUser', () => {
    it('should follow a user successfully', async () => {
      jest.spyOn(followService, 'followUser').mockResolvedValue(expectedFollow);
      const result = await followController.followUser(uuidDto, userTokenDto);
      expect(result).toEqual(expectedFollow);
      expect(followService.followUser).toHaveBeenCalledWith({
        followingId: uuidDto.id,
        followerId: userTokenDto.sub,
      });
    });

    it('should throw error when user not found', async () => {
      jest
        .spyOn(followService, 'followUser')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(
        followController.followUser(uuidDto, userTokenDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when trying to follow yourself', async () => {
      jest
        .spyOn(followService, 'followUser')
        .mockRejectedValue(
          new BadRequestException('You cannot follow yourself'),
        );
      await expect(
        followController.followUser(uuidDto, userTokenDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when already following', async () => {
      jest
        .spyOn(followService, 'followUser')
        .mockRejectedValue(
          new BadRequestException('You already follow this user'),
        );
      await expect(
        followController.followUser(uuidDto, userTokenDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user successfully', async () => {
      const expectedResult = {
        message: 'User unfollowed successfully',
      };

      jest
        .spyOn(followService, 'unfollowUser')
        .mockResolvedValue(expectedResult);

      const result = await followController.unfollowUser(uuidDto, userTokenDto);
      expect(result).toEqual(expectedResult);
      expect(followService.unfollowUser).toHaveBeenCalledWith({
        followingId: uuidDto.id,
        followerId: userTokenDto.sub,
      });
    });

    it('should throw error when not following', async () => {
      jest
        .spyOn(followService, 'unfollowUser')
        .mockRejectedValue(
          new NotFoundException('You are not following this user'),
        );
      await expect(
        followController.unfollowUser(uuidDto, userTokenDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findFollowersByUserId', () => {
    it('should return paginated followers', async () => {
      const paginationDto: paginationDto = { page: 1 };
      const expectedResult = {
        users: [expectedUser],
        total: 1,
        totalPages: 1,
      };

      jest
        .spyOn(followService, 'findFollowersByUserId')
        .mockResolvedValue(expectedResult);

      const result = await followController.findFollowersByUserId(
        userTokenDto,
        paginationDto,
      );
      expect(result).toEqual(expectedResult);
      expect(followService.findFollowersByUserId).toHaveBeenCalledWith({
        userId: userTokenDto.sub,
        page: paginationDto.page,
      });
    });

    it('should return posts from following with default page', async () => {
      const emptyQuery = {} as any;
      const expectedResult = {
        users: [expectedUser],
        total: 1,
        totalPages: 1,
      };

      jest
        .spyOn(followService, 'findFollowersByUserId')
        .mockResolvedValue(expectedResult);

      const result = await followController.findFollowersByUserId(
        userTokenDto,
        emptyQuery,
      );
      expect(result).toEqual(expectedResult);
      expect(followService.findFollowersByUserId).toHaveBeenCalledWith({
        userId: userTokenDto.sub,
        page: 1,
      });
    });
  });

  describe('findFollowingByUserId', () => {
    it('should return paginated following users', async () => {
      const paginationDto: paginationDto = { page: 1 };
      const expectedResult = {
        users: [expectedUser],
        total: 1,
        totalPages: 1,
      };

      jest
        .spyOn(followService, 'findFollowingByUserId')
        .mockResolvedValue(expectedResult);

      const result = await followController.findFollowingByUserId(
        userTokenDto,
        paginationDto,
      );
      expect(result).toEqual(expectedResult);
      expect(followService.findFollowingByUserId).toHaveBeenCalledWith({
        userId: userTokenDto.sub,
        page: paginationDto.page,
      });
    });

    it('should return posts from following with default page', async () => {
      const emptyQuery = {} as any;
      const expectedResult = {
        users: [expectedUser],
        total: 1,
        totalPages: 1,
      };

      jest
        .spyOn(followService, 'findFollowingByUserId')
        .mockResolvedValue(expectedResult);

      const result = await followController.findFollowingByUserId(
        userTokenDto,
        emptyQuery,
      );
      expect(result).toEqual(expectedResult);
      expect(followService.findFollowingByUserId).toHaveBeenCalledWith({
        userId: userTokenDto.sub,
        page: 1,
      });
    });
  });
});
