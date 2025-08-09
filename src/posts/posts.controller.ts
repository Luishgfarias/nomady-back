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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostControllerDto } from './dto/create-post-controller.dto';
import { UpdatePostControllerDto } from './dto/update-post-controller.dto';
import { AuthenticateGuard } from 'src/common/guards/authenticate.guard';
import { UserToken } from 'src/common/params/user-token.param';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';
import { uuidDto } from 'src/common/dtos/uuid.dto';
import { PublishedPostDto } from './dto/published-post.dto';
import { LikesService } from 'src/likes/likes.service';
import { paginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedPostsResponseDto, PostResponseDto } from './dto/paginated-posts-response.dto';
import { PaginatedLikedPostsResponseDto } from 'src/likes/dto/paginated-liked-posts-response.dto';
import { DeletePostResponseDto } from './dto/delete-post-response.dto';

@ApiTags('Posts')
@ApiBearerAuth('JWT-auth')
@Controller('posts')
@UseGuards(AuthenticateGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
  ) {}

  @Post(':id/like')
  @ApiOperation({ summary: 'Curtir um post' })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({ status: 201, description: 'Post curtido com sucesso' })
  @ApiResponse({ status: 400, description: 'Post já curtido' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  likePost(@Param() { id }: uuidDto, @UserToken() user: UserTokenDto) {
    return this.likesService.like({ postId: id, userId: user.sub });
  }

  @Delete(':id/unlike')
  @ApiOperation({ summary: 'Descurtir um post' })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({ status: 200, description: 'Post descurtido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  unlikePost(@Param() { id }: uuidDto, @UserToken() user: UserTokenDto) {
    return this.likesService.unlike({ postId: id, userId: user.sub });
  }

  @Get('likes')
  @ApiOperation({ summary: 'Listar posts curtidos pelo usuário' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de posts curtidos',
    type: PaginatedLikedPostsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findLikedPosts(
    @UserToken() user: UserTokenDto,
    @Query() { page }: paginationDto,
  ) {
    return this.likesService.findLikedPostsByUserId({
      userId: user.sub,
      page: page || 1,
    });
  }

  @Get('following')
  @ApiOperation({ summary: 'Listar posts dos usuários seguidos' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de posts dos usuários seguidos',
    type: PaginatedPostsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findPostsFromFollowing(
    @UserToken() user: UserTokenDto,
    @Query() { page }: paginationDto,
  ) {
    return this.postsService.findPostsFromFollowing({
      userId: user.sub,
      page: page || 1,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo post' })
  @ApiResponse({
    status: 201,
    description: 'Post criado com sucesso',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(
    @UserToken() user: UserTokenDto,
    @Body() createPostDto: CreatePostControllerDto,
  ) {
    return this.postsService.create({ ...createPostDto, authorId: user.sub });
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os posts' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de posts',
    type: PaginatedPostsResponseDto,
  })
  findAll(@Query() { page }: paginationDto) {
    return this.postsService.findAll({ page: page || 1 });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter post específico' })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({
    status: 200,
    description: 'Dados do post',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  findOne(@Param() { id }: uuidDto) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar post' })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({
    status: 200,
    description: 'Post atualizado com sucesso',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  update(
    @Param() { id }: uuidDto,
    @Body() updatePostDto: UpdatePostControllerDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Arquivar/desarquivar post' })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({
    status: 200,
    description: 'Status do post alterado',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  archive(
    @Param() { id }: uuidDto,
    @Body() publishedPostDto: PublishedPostDto,
  ) {
    return this.postsService.archive(id, publishedPostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar post' })
  @ApiParam({ name: 'id', description: 'ID do post' })
  @ApiResponse({
    status: 200,
    description: 'Post deletado com sucesso',
    type: DeletePostResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  remove(@Param() { id }: uuidDto) {
    return this.postsService.remove(id);
  }
}
