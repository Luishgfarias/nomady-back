import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserControllerDto } from './dto/create-user-controller.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  @Patch(':id')
  update(@Param() { id }: uuidDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param() { id }: uuidDto) {
    return this.usersService.remove(id);
  }
}
