import { Injectable } from '@nestjs/common';
import { CreateUserControllerDto } from './dto/create-user-controller.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { HashingService } from 'src/auth/hashing/hashing.service';

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

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
