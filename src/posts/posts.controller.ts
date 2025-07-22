import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostControllerDto } from './dto/create-post-controller.dto';
import { UpdatePostControllerDto } from './dto/update-post-controller.dto';
import { AuthenticateGuard } from 'src/common/guards/authenticate.guard';
import { UserToken } from 'src/common/params/user-token.param';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';
import { uuidDto } from 'src/common/dtos/uuid.dto';
import { PublishedPostDto } from './dto/published-post.dto';

@Controller('posts')
@UseGuards(AuthenticateGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @UserToken() user: UserTokenDto,
    @Body() createPostDto: CreatePostControllerDto,
  ) {
    return this.postsService.create({ ...createPostDto, authorId: user.sub });
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param() { id }: uuidDto) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param() { id }: uuidDto,
    @Body() updatePostDto: UpdatePostControllerDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Patch(':id')
  archive(
    @Param() { id }: uuidDto,
    @Body() publishedPostDto: PublishedPostDto,
  ) {
    return this.postsService.archive(id, publishedPostDto);
  }

  @Delete(':id')
  remove(@Param() { id }: uuidDto) {
    return this.postsService.remove(id);
  }
}
