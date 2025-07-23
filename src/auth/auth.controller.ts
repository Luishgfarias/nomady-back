import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserControllerDto } from 'src/users/dto/create-user-controller.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserToken } from 'src/common/params/user-token.param';
import { UserTokenDto } from './dto/user-token.dto';
import { UsersService } from 'src/users/users.service';
import { AuthenticateGuard } from 'src/common/guards/authenticate.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserControllerDto: CreateUserControllerDto) {
    return this.authService.register(createUserControllerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(AuthenticateGuard)
  @Get('me')
  findOne(@UserToken() user: UserTokenDto) {
    return this.usersService.findOne(user.sub);
  }

  //TO DO implement logout
}
