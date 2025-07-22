import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  controllers: [UsersController],
  imports: [PrismaModule, AuthModule],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
