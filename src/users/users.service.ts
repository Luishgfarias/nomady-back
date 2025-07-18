import { Injectable } from '@nestjs/common';
import { CreateUserControllerDto } from './dto/create-user-controller.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { searchUserDto } from './dto/search-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private hashingService: HashingService,
  ) {}
  async create(createUserDto: CreateUserControllerDto) {
    return this.userRepository.createUser({
      email: createUserDto.email,
      passwordHash: await this.hashingService.hashPassword(
        createUserDto.password,
      ),
      name: createUserDto.name,
    });
  }

  async searchUsers(searchUser: searchUserDto) {
    const skip = (searchUser.page - 1) * 10;
    const result = await this.userRepository.searchUsers(searchUser, skip);
    return { users: result.users, totalPages: Math.ceil(result.total / 10) };
  }

  async findOne(id: string) {
    return await this.userRepository.findUserById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepository.updateUser(id, updateUserDto);
  }

  async remove(id: string) {
    const result = await this.userRepository.deleteUser(id);
    if (result) {
      return { message: 'User deleted successfully' };
    }
  }
}
