import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { CreateUserControllerDto } from './dto/create-user-controller.dto';
import { CreateUserRepositoryDto } from './dto/create-user-repository.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { searchUserDto } from './dto/search-user.dto';
import { UpdateUserControllerDto } from './dto/update-user-controller.dto';
import { UpdateUserRepositoryDto } from './dto/update-user-repository.dto';

describe('UsersService', () => {
  let userService: UsersService;
  let userRepository: UserRepository;
  let hashingService: HashingService;

  const expectedUser = {
    id: expect.any(String),
    name: 'user test',
    email: 'user@test.com',
    profilePhoto: null,
  };
  const userId = 'uuid-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            findUserById: jest.fn(),
            findUserByEmail: jest.fn(),
            searchUsers: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    hashingService = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
  it('userRepository should be defined', () => {
    expect(userRepository).toBeDefined();
  });
  it('hashingService should be defined', () => {
    expect(hashingService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserControllerDto = {
        name: 'user test',
        email: 'user@test.com',
        password: '123456',
      };
      const createUserRepositoryDto: CreateUserRepositoryDto = {
        name: 'user test',
        email: 'user@test.com',
        passwordHash: 'password-hashed',
      };

      jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue('password-hashed');
      jest.spyOn(userRepository, 'createUser').mockResolvedValue(expectedUser);

      const result = await userService.create(createUserDto);
      expect(hashingService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(userRepository.createUser).toHaveBeenCalledWith(
        createUserRepositoryDto,
      );
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if the user email already exists', async () => {
      const createUserDto: CreateUserControllerDto = {
        name: 'user test',
        email: 'user@test.com',
        password: '123456',
      };
      const createUserRepositoryDto: CreateUserRepositoryDto = {
        name: 'user test',
        email: 'user@test.com',
        passwordHash: 'password-hashed',
      };

      jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue('password-hashed');
      jest
        .spyOn(userRepository, 'createUser')
        .mockRejectedValue(new ConflictException('Email already exists'));

      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(hashingService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(userRepository.createUser).toHaveBeenCalledWith(
        createUserRepositoryDto,
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users', async () => {
      const searchUserDto: searchUserDto = {
        name: 'user test',
        page: 1,
      };
      const expectedUsers = {
        users: [expectedUser],
        total: 10,
      };
      const expectedResult = {
        users: [expectedUser],
        total: 10,
        totalPages: 1,
      };

      jest
        .spyOn(userRepository, 'searchUsers')
        .mockResolvedValue(expectedUsers);

      const result = await userService.searchUsers(searchUserDto);
      expect(userRepository.searchUsers).toHaveBeenCalledWith(searchUserDto, 0);
      expect(result).toEqual(expectedResult);
    });

    it('should calculate correct totalPages', async () => {
      const searchUserDto: searchUserDto = {
        name: 'user test',
        page: 1,
      };
      const expectedUsers = {
        users: [expectedUser],
        total: 25,
      };
      const expectedResult = {
        users: [expectedUser],
        total: 25,
        totalPages: 3, // Math.ceil(25 / 10) = 3
      };

      jest
        .spyOn(userRepository, 'searchUsers')
        .mockResolvedValue(expectedUsers);

      const result = await userService.searchUsers(searchUserDto);
      expect(result).toEqual(expectedResult);
      expect(userRepository.searchUsers).toHaveBeenCalledWith(searchUserDto, 0);
    });

    it('should calculate correct skip for page 2', async () => {
      const searchUserDto: searchUserDto = {
        name: 'user test',
        page: 2,
      };
      const expectedUsers = {
        users: [expectedUser],
        total: 25,
      };
      const expectedResult = {
        users: [expectedUser],
        total: 25,
        totalPages: 3,
      };

      jest
        .spyOn(userRepository, 'searchUsers')
        .mockResolvedValue(expectedUsers);

      const result = await userService.searchUsers(searchUserDto);
      expect(result).toEqual(expectedResult);
      expect(userRepository.searchUsers).toHaveBeenCalledWith(
        searchUserDto,
        10, // skip = (2-1) * 10 = 10
      );
    });

    it('should throw an error if the user is not found', async () => {
      const searchUserDto: searchUserDto = {
        name: 'user test',
        page: 1,
      };
      jest
        .spyOn(userRepository, 'searchUsers')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(userService.searchUsers(searchUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.searchUsers).toHaveBeenCalledWith(searchUserDto, 0);
    });
  });

  describe('findOne', () => {
    it('should find a user', async () => {
      const expectedUser = {
        id: userId,
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
        _count: {
          followers: 0,
          following: 0,
        },
      };

      jest
        .spyOn(userRepository, 'findUserById')
        .mockResolvedValue(expectedUser);

      const result = await userService.findOne(userId);
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if the user is not found', async () => {
      jest
        .spyOn(userRepository, 'findUserById')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(userService.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'user@test.com';
      const expectedUser = {
        id: userId,
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
        passwordHash: 'password-hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          followers: 0,
          following: 0,
        },
      };

      jest
        .spyOn(userRepository, 'findUserByEmail')
        .mockResolvedValue(expectedUser);

      const result = await userService.findByEmail(email);
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if the user is not found', async () => {
      const email = 'user@test.com';
      jest
        .spyOn(userRepository, 'findUserByEmail')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(userService.findByEmail(email)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserControllerDto = {
        name: 'user test',
        email: 'user@test.com',
        password: '123456',
        profilePhoto: 'profile-photo-url',
      };
      const updateUserRepositoryDto: Partial<UpdateUserRepositoryDto> = {
        name: 'user test',
        email: 'user@test.com',
        passwordHash: 'password-hashed',
        profilePhoto: 'profile-photo-url',
      };

      const expectedUser = {
        id: userId,
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
        passwordHash: 'password-hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          followers: 0,
          following: 0,
        },
      };

      jest
        .spyOn(userRepository, 'findUserById')
        .mockResolvedValue(expectedUser);
      jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue('password-hashed');
      jest.spyOn(userRepository, 'updateUser').mockResolvedValue(expectedUser);

      const result = await userService.update(userId, updateUserDto);
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(hashingService.hashPassword).toHaveBeenCalledWith(
        updateUserDto.password,
      );
      expect(userRepository.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserRepositoryDto,
      );
      expect(result).toEqual(expectedUser);
    });

    it('should update a user without password', async () => {
      const updateUserDto: UpdateUserControllerDto = {
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: 'profile-photo-url',
      };
      const updateUserRepositoryDto: Partial<UpdateUserRepositoryDto> = {
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: 'profile-photo-url',
      };
      const expectedUser = {
        id: userId,
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: 'profile-photo-url',
        passwordHash: 'password-hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          followers: 0,
          following: 0,
        },
      };

      jest
        .spyOn(userRepository, 'findUserById')
        .mockResolvedValue(expectedUser);
      jest
        .spyOn(hashingService, 'hashPassword')
        .mockResolvedValue('password-hashed');
      jest.spyOn(userRepository, 'updateUser').mockResolvedValue(expectedUser);

      const result = await userService.update(userId, updateUserDto);
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(hashingService.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserRepositoryDto,
      );
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if the user is not found', async () => {
      const updateUserDto: UpdateUserControllerDto = {
        name: 'user test',
        email: 'user@test.com',
        password: '123456',
        profilePhoto: 'profile-photo-url',
      };

      jest
        .spyOn(userRepository, 'findUserById')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const expectedUser = {
        id: userId,
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
        passwordHash: 'password-hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          followers: 0,
          following: 0,
        },
      };
      const expectedResult = { message: 'User deleted successfully' };

      jest
        .spyOn(userRepository, 'findUserById')
        .mockResolvedValue(expectedUser);
      jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(expectedUser);

      const result = await userService.remove(userId);
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if the user is not found', async () => {
      jest
        .spyOn(userRepository, 'deleteUser')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.remove(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
