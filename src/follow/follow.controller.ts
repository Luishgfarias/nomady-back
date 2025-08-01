import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { AuthenticateGuard } from 'src/common/guards/authenticate.guard';
import { uuidDto } from 'src/common/dtos/uuid.dto';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';
import { UserToken } from 'src/common/params/user-token.param';

@ApiTags('Seguidores')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(AuthenticateGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow/:id')
  @ApiOperation({ summary: 'Seguir um usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário a ser seguido' })
  @ApiResponse({ status: 201, description: 'Usuário seguido com sucesso' })
  @ApiResponse({ status: 400, description: 'Já está seguindo este usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  followUser(@Param() { id }: uuidDto, @UserToken() user: UserTokenDto) {
    return this.followService.followUser({
      followingId: id,
      followerId: user.sub,
    });
  }

  @Delete('unfollow/:id')
  @ApiOperation({ summary: 'Deixar de seguir um usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário a deixar de seguir' })
  @ApiResponse({ status: 200, description: 'Deixou de seguir com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Relacionamento não encontrado' })
  unfollowUser(@Param() { id }: uuidDto, @UserToken() user: UserTokenDto) {
    return this.followService.unfollowUser({
      followingId: id,
      followerId: user.sub,
    });
  }

  @Get('followers')
  @ApiOperation({ summary: 'Listar seguidores do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de seguidores' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findFollowersByUserId(@UserToken() user: UserTokenDto) {
    return this.followService.findFollowersByUserId(user.sub);
  }

  @Get('following')
  @ApiOperation({ summary: 'Listar usuários que o usuário logado segue' })
  @ApiResponse({ status: 200, description: 'Lista de usuários seguidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findFollowingByUserId(@UserToken() user: UserTokenDto) {
    return this.followService.findFollowingByUserId(user.sub);
  }
}
