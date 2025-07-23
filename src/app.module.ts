import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ConfigModule.forRoot({}), PostsModule, LikesModule],
})
export class AppModule {}
