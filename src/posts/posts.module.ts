import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostsRepository } from './posts.repository';
import { UsersModule } from 'src/users/users.module';
import { LikesModule } from 'src/likes/likes.module';
import { FollowModule } from 'src/follow/follow.module';

@Module({
  controllers: [PostsController],
  imports: [PrismaModule, AuthModule, UsersModule, LikesModule, FollowModule],
  providers: [PostsService, PostsRepository],
  exports: [PostsService],
})
export class PostsModule {}
