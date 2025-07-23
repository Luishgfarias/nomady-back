import { forwardRef, Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesRepository } from './likes.repository';
import { PostsModule } from 'src/posts/posts.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [LikesService, LikesRepository],
  imports: [PrismaModule, forwardRef(() => PostsModule)],
  exports: [LikesService],
})
export class LikesModule {}
