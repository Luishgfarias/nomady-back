import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfigs from 'src/auth/configs/jwt.configs';
import { AuthenticateGuard } from 'src/common/guards/authenticate.guard';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';
import { searchUserDto } from './dto/search-user.dto';
import { UpdateUserControllerDto } from './dto/update-user-controller.dto';
import { uuidDto } from 'src/common/dtos/uuid.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let jwtService: JwtService;

  const userId = 'uuid-123';
  const userTokenDto: UserTokenDto = {
    sub: userId,
    email: 'user@test.com',
    iat: 1234567890,
    exp: 1234567890,
    aud: 'test-audience',
    iss: 'test-issuer',
  };
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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            searchUsers: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
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
        {
          provide: AuthenticateGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  it('jwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('usersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('search', () => {
    it('should search users successfully', async () => {
      const searchUserDto: searchUserDto = {
        name: 'test',
        page: 1,
      };
      const expectedResult = {
        users: [expectedUser],
        total: 1,
        totalPages: 1,
      };

      jest.spyOn(usersService, 'searchUsers').mockResolvedValue(expectedResult);

      const result = await usersController.search(searchUserDto);
      expect(result).toEqual(expectedResult);
      expect(usersService.searchUsers).toHaveBeenCalledWith(searchUserDto);
    });

    it('should handle search with pagination', async () => {
      const searchUserDto: searchUserDto = {
        name: 'test',
        page: 2,
      };
      const expectedResult = {
        users: [expectedUser],
        total: 2,
        totalPages: 2,
      };

      jest.spyOn(usersService, 'searchUsers').mockResolvedValue(expectedResult);

      const result = await usersController.search(searchUserDto);
      expect(result).toEqual(expectedResult);
      expect(usersService.searchUsers).toHaveBeenCalledWith(searchUserDto);
    });

    it('should handle search without name parameter', async () => {
      const searchUserDto: Partial<searchUserDto> = {
        page: 1,
      };
      const expectedResult = {
        users: [expectedUser],
        total: 1,
        totalPages: 1,
      };

      jest.spyOn(usersService, 'searchUsers').mockResolvedValue(expectedResult);

      const result = await usersController.search(
        searchUserDto as searchUserDto,
      );
      expect(result).toEqual(expectedResult);
      expect(usersService.searchUsers).toHaveBeenCalledWith(searchUserDto);
    });
  });

  describe('findOne', () => {
    it('should find a user by id successfully', async () => {
      const uuidDto: uuidDto = {
        id: userId,
      };
      const expectedResult = expectedUser;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(expectedResult);

      const result = await usersController.findOne(uuidDto);
      expect(result).toEqual(expectedResult);
      expect(usersService.findOne).toHaveBeenCalledWith(uuidDto.id);
    });

    it('should handle user not found', async () => {
      const uuidDto: uuidDto = {
        id: 'invalid-uuid',
      };

      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(usersController.findOne(uuidDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(uuidDto.id);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserControllerDto = {
        name: 'test',
        email: 'test@test.com',
        profilePhoto: 'profile-photo-url',
      };
      const expectedResult = expectedUser;

      jest.spyOn(usersService, 'update').mockResolvedValue(expectedResult);

      const result = await usersController.update(userTokenDto, updateUserDto);
      expect(result).toEqual(expectedResult);
      expect(usersService.update).toHaveBeenCalledWith(
        userTokenDto.sub,
        updateUserDto,
      );
    });

    it('should update only provided fields', async () => {
      const updateUserDto: Partial<UpdateUserControllerDto> = {
        name: 'test',
      };
      const expectedResult = expectedUser;

      jest.spyOn(usersService, 'update').mockResolvedValue(expectedResult);

      const result = await usersController.update(
        userTokenDto,
        updateUserDto as UpdateUserControllerDto,
      );
      expect(result).toEqual(expectedResult);
      expect(usersService.update).toHaveBeenCalledWith(
        userTokenDto.sub,
        updateUserDto,
      );
    });

    it('should handle password update', async () => {
      const updateUserDto: Partial<UpdateUserControllerDto> = {
        password: 'new-password',
      };
      const expectedResult = expectedUser;

      jest.spyOn(usersService, 'update').mockResolvedValue(expectedResult);

      const result = await usersController.update(
        userTokenDto,
        updateUserDto as UpdateUserControllerDto,
      );
      expect(result).toEqual(expectedResult);
      expect(usersService.update).toHaveBeenCalledWith(
        userTokenDto.sub,
        updateUserDto,
      );
    });

    it('should throw not found exception when user not found', async () => {
      const updateUserDto: UpdateUserControllerDto = {
        name: 'test',
        email: 'test@test.com',
        profilePhoto: 'profile-photo-url',
      };

      jest
        .spyOn(usersService, 'update')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        usersController.update(userTokenDto, updateUserDto),
      ).rejects.toThrow(NotFoundException);
      expect(usersService.update).toHaveBeenCalledWith(
        userTokenDto.sub,
        updateUserDto,
      );
    });
    // it('should handle profile photo update', () => {
    //   // TODO: Testar atualização de foto de perfil
    // });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const expectedResult = { message: 'User removed successfully' };

      jest.spyOn(usersService, 'remove').mockResolvedValue(expectedResult);

      const result = await usersController.remove(userTokenDto);
      expect(result).toEqual(expectedResult);
      expect(usersService.remove).toHaveBeenCalledWith(userTokenDto.sub);
    });

    it('should handle user not found during removal', async () => {
      jest
        .spyOn(usersService, 'remove')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(usersController.remove(userTokenDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.remove).toHaveBeenCalledWith(userTokenDto.sub);
    });
  });
});
