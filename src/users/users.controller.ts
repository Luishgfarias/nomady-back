import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserControllerDto } from './dto/update-user-controller.dto';
import { searchUserDto } from './dto/search-user.dto';
import { AuthenticateGuard } from 'src/common/guards/authenticate.guard';
import { UserToken } from 'src/common/params/user-token.param';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';

@Controller('users')
@UseGuards(AuthenticateGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  search(@Query() searchUser: searchUserDto) {
    return this.usersService.searchUsers(searchUser);
  }

  @Get('profile')
  findOne(@UserToken() user: UserTokenDto) {
    return this.usersService.findOne(user.sub);
  }

  @Put()
  update(
    @UserToken() user: UserTokenDto,
    @Body() updateUserDto: UpdateUserControllerDto,
  ) {
    if (
      !updateUserDto ||
      Object.keys(updateUserDto).every(
        (key) => updateUserDto[key] === undefined,
      )
    ) {
      throw new BadRequestException(
        'You must provide at least one field to update.',
      );
    }
    return this.usersService.update(user.sub, updateUserDto);
  }

  @Delete()
  remove(@UserToken() user: UserTokenDto) {
    return this.usersService.remove(user.sub);
  }
}
