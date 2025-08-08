import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserControllerDto } from 'src/users/dto/create-user-controller.dto';
import { ConfigType } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import jwtConfigs from './configs/jwt.configs';
import { HashingService } from './hashing/hashing.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    @Inject(jwtConfigs.KEY)
    private readonly jwtConfigurations: ConfigType<typeof jwtConfigs>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserControllerDto: CreateUserControllerDto) {
    return this.usersService.create(createUserControllerDto);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findByEmail(email);
    const isPasswordValid = user && await this.hashingService.comparePassword(
      password,
      user.passwordHash,
    );
    
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, name: user.name };
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(user.id, this.jwtConfigurations.expiresIn, payload),
      this.generateToken(user.id, this.jwtConfigurations.refreshExpiresIn),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken({ refreshToken }: RefreshTokenDto) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.jwtConfigurations.secret,
    });
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const accessToken = await this.generateToken(
      user.id,
      this.jwtConfigurations.expiresIn,
      { email: user.email, name: user.name },
    );
    return {
      accessToken,
    };
  }

  async generateToken<T>(sub: string, expiresIn: number, payload?: T) {
    try {
      return await this.jwtService.signAsync(
        { sub, ...payload },
        {
          expiresIn,
          issuer: this.jwtConfigurations.issuer,
          audience: this.jwtConfigurations.audience,
          secret: this.jwtConfigurations.secret,
        },
      );
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token configuration');
    }
      throw new ServiceUnavailableException('Error generating token');
    }
  }
}
