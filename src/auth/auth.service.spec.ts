import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { HashingService } from './hashing/hashing.service';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import jwtConfigs from './configs/jwt.configs';
import { ConflictException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let hashingService: HashingService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            comparePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
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

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    hashingService = module.get<HashingService>(HashingService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('usersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('hashingService should be defined', () => {
    expect(hashingService).toBeDefined();
  });

  it('jwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const createUserControllerDto = {
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

      jest.spyOn(usersService, 'create').mockResolvedValue(expectedUser);

      const result = await authService.register(createUserControllerDto);
      expect(usersService.create).toHaveBeenCalledWith(createUserControllerDto);
      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if the user email already exists', async () => {
      const createUserControllerDto = {
        name: 'user test',
        email: 'user@test.com',
        password: '123456',
      };

      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new ConflictException('Email already exists'));

      await expect(
        authService.register(createUserControllerDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto = {
        email: 'user@test.com',
        password: '123456',
      };
      const expectedUser = {
        id: expect.any(String),
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
        passwordHash: 'password-hashed',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      const expectedLoginResponse = {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(expectedUser);
      jest.spyOn(hashingService, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(expect.any(String));

      const result = await authService.login(loginDto);
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashingService.comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        expectedUser.passwordHash,
      );
      expect(result).toEqual(expectedLoginResponse);
    });

    it('should throw an error if the user does not exist', async () => {
      const loginDto = {
        email: 'user@test.com',
        password: '123456',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null as any);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if the password is incorrect', async () => {
      const loginDto = {
        email: 'user@test.com',
        password: '123456',
      };
      const expectedUser = {
        id: expect.any(String),
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
        passwordHash: 'password-hashed',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(expectedUser);
      jest.spyOn(hashingService, 'comparePassword').mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh a token', async () => {
      const refreshTokenDto = {
        refreshToken: expect.any(String),
      };
      const expectedPayload = {
        sub: expect.any(String),
      };
      const expectedUser = {
        id: expect.any(String),
        name: 'user test',
        email: 'user@test.com',
        profilePhoto: null,
        _count: {
          followers: 0,
          following: 0,
        },
      };
      const expectedResponse = {
        accessToken: expect.any(String),
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue(expectedPayload);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(expectedUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(expect.any(String));

      const result = await authService.refreshToken(refreshTokenDto);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken, {
        secret: expect.any(String),
      });
      expect(usersService.findOne).toHaveBeenCalledWith(expectedPayload.sub);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if the token is invalid', async () => {
      const refreshTokenDto = {
        refreshToken: expect.any(String),
      };

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new JsonWebTokenError('Invalid token');
      });

      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        JsonWebTokenError,
      );
    });

    it('should throw an error if the token has invalid signature', async () => {
      const refreshTokenDto = {
        refreshToken: expect.any(String),
      };

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new JsonWebTokenError('invalid signature');
      });

      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        JsonWebTokenError,
      );
    });

    
    it('should throw an error if the token has expired', async () => {
      const refreshTokenDto = {
        refreshToken: expect.any(String),
      };

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new JsonWebTokenError('jwt expired');
      });

      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        JsonWebTokenError,
      );
    });

    it('should throw an error if the user does not exist', async () => {
      const refreshTokenDto = {
        refreshToken: expect.any(String),
      };
      const expectedPayload = {
        sub: 'user123',
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue(expectedPayload);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null as any);

      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken, {
        secret: expect.any(String),
      });
      expect(usersService.findOne).toHaveBeenCalledWith(expectedPayload.sub);
    });
  });

  describe('generateToken', () => {
    it('should generate a token', async () => {
      const sub = 'user123';
      const expiresIn = 3600;
      const payload = { email: 'user@test.com', name: 'user test' };
      const expectedToken = expect.any(String);

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(expectedToken);

      const result = await authService.generateToken(sub, expiresIn, payload);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub, ...payload },
        {
          expiresIn,
          issuer: 'test-issuer',
          audience: 'test-audience',
          secret: 'test-secret',
        },
      );
      expect(result).toEqual(expectedToken);
    });
    
    it('should throw an error if the token is invalid', async () => {
      const sub = 'user123';
      const expiresIn = 3600;
      const payload = { email: 'user@test.com', name: 'user test' };

      jest.spyOn(jwtService, 'signAsync').mockImplementation(() => {
        throw new JsonWebTokenError('Invalid JWT configuration');
      });

      await expect(authService.generateToken(sub, expiresIn, payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if the secret is unavailable', async () => {
      const sub = 'user123';
      const expiresIn = 3600;
      const payload = { email: 'user@test.com', name: 'user test' };

      jest.spyOn(jwtService, 'signAsync').mockImplementation(() => {
        throw new Error();
      });

      await expect(authService.generateToken(sub, expiresIn, payload)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
