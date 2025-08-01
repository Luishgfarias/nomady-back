import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { FollowRepository } from './follow.repository';

@Module({
  controllers: [FollowController],
  providers: [FollowService, FollowRepository],
  imports: [UsersModule, PrismaModule, AuthModule],
  exports: [FollowRepository],
})
export class FollowModule {}
