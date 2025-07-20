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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserControllerDto } from './dto/create-user-controller.dto';
import { UpdateUserControllerDto } from './dto/update-user-controller.dto';
import { searchUserDto } from './dto/search-user.dto';
import { uuidDto } from 'src/common/dtos/uuid.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserControllerDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  search(@Query() searchUser: searchUserDto) {
    return this.usersService.searchUsers(searchUser);
  }

  @Get(':id')
  findOne(@Param() { id }: uuidDto) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param() { id }: uuidDto,
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
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param() { id }: uuidDto) {
    return this.usersService.remove(id);
  }
}
