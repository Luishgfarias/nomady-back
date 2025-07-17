import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserRepositoryDto } from './dto/create-user-repository.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserRepositoryDto) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserDto) {
    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findUserById(id: string) {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllUsers() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
