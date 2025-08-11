import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateGuard } from './authenticate.guard';
import { UsersService } from 'src/users/users.service';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import jwtConfigs from 'src/auth/configs/jwt.configs';
import {
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthenticateGuard', () => {
  let guard: AuthenticateGuard;
  let usersService: UsersService;
  let jwtService: JwtService;

  const jwtConfiguration = {
    secret: 'test-secret',
    audience: 'test-audience',
    issuer: 'test-issuer',
    expiresIn: 3600,
    refreshExpiresIn: 86400,
  };
  const mockToken = 'test-token';
  const mockContext: ExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      }),
    }),
  } as ExecutionContext;
  const mockUser = {
    sub: 1,
    email: 'test@test.com',
  };
  const mockValidUser = {
    id: 'uuid',
    email: 'test@test.com',
    profilePhoto: 'test-profile-photo',
    name: 'test-name',
    _count: {
      followers: 0,
      following: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticateGuard,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfigs.KEY,
          useValue: jwtConfiguration,
        },
      ],
    }).compile();

    guard = module.get<AuthenticateGuard>(AuthenticateGuard);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('usersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access with valid token', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockValidUser);

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        mockToken,
        jwtConfiguration,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.sub);
    });

    it('should deny access with invalid token', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new JsonWebTokenError('Invalid token'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        mockToken,
        jwtConfiguration,
      );
    });

    it('should deny access with expired token', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new TokenExpiredError('Token expired', new Date()));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        mockToken,
        jwtConfiguration,
      );
    });

    it('should deny access without token', async () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should deny access with user not found', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockUser);
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        mockToken,
        jwtConfiguration,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.sub);
    });

    it('should deny access with generic error', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Generic error'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
