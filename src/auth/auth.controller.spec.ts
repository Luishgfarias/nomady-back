import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfigs from './configs/jwt.configs';
import { CreateUserControllerDto } from 'src/users/dto/create-user-controller.dto';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserTokenDto } from './dto/user-token.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('AuthController should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('UsersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('JwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserControllerDto: CreateUserControllerDto = {
        name: 'user test',
        email: 'user@test.com',
        password: '123456',
      };
      const expectedUser = {
        id: expect.any(String),
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
      };

      jest.spyOn(authService, 'register').mockResolvedValue(expectedUser);

      const result = await authController.register(createUserControllerDto);
      expect(result).toEqual(expectedUser);
      expect(authService.register).toHaveBeenCalledWith(
        createUserControllerDto,
      );
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the user email already exists', async () => {
      const createUserControllerDto: CreateUserControllerDto = {
        name: 'user test',
        email: 'user@test.com',
        password: '123456',
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new ConflictException('Email already exists'));

      await expect(
        authController.register(createUserControllerDto),
      ).rejects.toThrow(ConflictException);
      expect(authService.register).toHaveBeenCalledWith(
        createUserControllerDto,
      );
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'user@test.com',
        password: '123456',
      };

      const expectedLoginResponse: LoginResponseDto = {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedLoginResponse);

      const result = await authController.login(loginDto);
      expect(result).toEqual(expectedLoginResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the user does not exist', async () => {
      const loginDto: LoginDto = {
        email: 'user@test.com',
        password: '123456',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'user@test.com',
        password: '123456',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      jest
        .spyOn(authService, 'refreshToken')
        .mockResolvedValue(expectedResponse);

      const result = await authController.refreshToken(refreshTokenDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      jest
        .spyOn(authService, 'refreshToken')
        .mockRejectedValue(new Error('Token inválido'));

      await expect(
        authController.refreshToken(refreshTokenDto),
      ).rejects.toThrow('Token inválido');
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('me', () => {
    it('should return my user', async () => {
      const userTokenDto: UserTokenDto = {
        sub: '1',
        email: 'user@test.com',
        aud: 'test-audience',
        iss: 'test-issuer',
        iat: 1717756800,
        exp: 1717756800,
      };

      const expectedUser = {
        _count: {
          followers: 0,
          following: 0,
        },
        id: '1',
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(expectedUser);

      const result = await authController.me(userTokenDto);
      expect(result).toEqual(expectedUser);
      expect(usersService.findOne).toHaveBeenCalledWith(userTokenDto.sub);
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if user not found', async () => {
      const userTokenDto: UserTokenDto = {
        sub: 'invalid-user-id',
        email: 'user@test.com',
        aud: 'test-audience',
        iss: 'test-issuer',
        iat: 1717756800,
        exp: 1717756800,
      };

      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(authController.me(userTokenDto)).rejects.toThrow(NotFoundException);
      expect(usersService.findOne).toHaveBeenCalledWith(userTokenDto.sub);
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
