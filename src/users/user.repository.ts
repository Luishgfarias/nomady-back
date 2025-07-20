import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserRepositoryDto } from './dto/create-user-repository.dto';
import { UpdateUserRepositoryDto } from './dto/update-user-repository.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';
import { searchUserDto } from './dto/search-user.dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}
  private notFoundException = new NotFoundException('User not found');
  async createUser(data: CreateUserRepositoryDto) {
    try {
      return await this.prisma.user.create({
        data,
        omit: { passwordHash: true, createdAt: true, updatedAt: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<UpdateUserRepositoryDto>) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        omit: { passwordHash: true, createdAt: true, updatedAt: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async findUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        omit: { passwordHash: true, createdAt: true, updatedAt: true },
      });
      if (!user) {
        throw this.notFoundException;
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async searchUsers(searchUser: searchUserDto, skip: number) {
    try {
      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where: {
            name: {
              contains: searchUser.name,
              mode: 'insensitive',
            },
          },
          skip: skip,
          take: 10,
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            // adicione só os campos que quiser retornar
          },
        }),

        this.prisma.user.count({
          where: {
            name: {
              contains: searchUser.name,
              mode: 'insensitive',
            },
          },
        }),
      ]);

      if (!users || users.length === 0) {
        throw this.notFoundException;
      }
      return {
        users,
        total,
      };
    } catch (error) {
      throw error;
    }
  }
}
