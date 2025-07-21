import { Injectable } from '@nestjs/common';
import { CreateUserControllerDto } from './dto/create-user-controller.dto';
import { UpdateUserControllerDto } from './dto/update-user-controller.dto';
import { UserRepository } from './user.repository';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { searchUserDto } from './dto/search-user.dto';
import { CreateUserRepositoryDto } from './dto/create-user-repository.dto';
import { UpdateUserRepositoryDto } from './dto/update-user-repository.dto';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private hashingService: HashingService,
  ) {}
  async create(createUserDto: CreateUserControllerDto) {
    let userDataCreate: CreateUserRepositoryDto = {
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash: await this.hashingService.hashPassword(
        createUserDto.password,
      ),
    };
    return this.userRepository.createUser(userDataCreate);
  }

  async searchUsers(searchUser: searchUserDto) {
    const skip = (searchUser.page - 1) * 10;
    const result = await this.userRepository.searchUsers(searchUser, skip);
    return { users: result.users, totalPages: Math.ceil(result.total / 10) };
  }

  async findOne(id: string) {
    return await this.userRepository.findUserById(id);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findUserByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserControllerDto) {
    await this.userRepository.findUserById(id);
    let userDataUpdate: Partial<UpdateUserRepositoryDto> = {
      ...updateUserDto,
    };
    if (updateUserDto.password) {
      console.log('aqui => ' + updateUserDto);
      userDataUpdate.passwordHash = await this.hashingService.hashPassword(
        updateUserDto.password,
      );
    }
    return await this.userRepository.updateUser(id, userDataUpdate);
  }

  async remove(id: string) {
    await this.userRepository.findUserById(id);
    const result = await this.userRepository.deleteUser(id);
    if (result) {
      return { message: 'User deleted successfully' };
    }
  }
}
