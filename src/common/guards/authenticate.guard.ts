import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfigs from 'src/auth/configs/jwt.configs';
import { REQUEST_USER } from '../constants/request-constants';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfigs.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfigs>,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const user = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const validUser = await this.usersService.findOne(user.sub);

      if (!validUser) {
        throw new UnauthorizedException('User not found');
      }

      request[REQUEST_USER] = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;

    if (!authorization) {
      return;
    }
    return authorization.split(' ')[1];
  }
}
