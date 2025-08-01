import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserControllerDto } from './dto/update-user-controller.dto';
import { searchUserDto } from './dto/search-user.dto';
import { AuthenticateGuard } from 'src/common/guards/authenticate.guard';
import { UserToken } from 'src/common/params/user-token.param';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';
import { uuidDto } from 'src/common/dtos/uuid.dto';

@ApiTags('Usuários')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(AuthenticateGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar usuários' })
  @ApiQuery({ name: 'name', required: false, description: 'Nome para buscar' })
  @ApiResponse({ status: 200, description: 'Lista de usuários encontrados' })
  @ApiResponse({ status: 404, description: 'Nenhum usuário encontrado' })
  search(@Query() searchUser: searchUserDto) {
    return this.usersService.searchUsers(searchUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter dados de um usuário específico' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findOne(@Param() { id }: uuidDto) {
    return this.usersService.findOne(id);
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  update(
    @UserToken() user: UserTokenDto,
    @Body() updateUserDto: UpdateUserControllerDto,
  ) {
    if (
      !updateUserDto ||
      Object.keys(updateUserDto).every(
        (key) => updateUserDto[key] === undefined,
      )
    ) {
      throw new BadRequestException(
        'You must provide at least one field to update.',
      );
    }
    return this.usersService.update(user.sub, updateUserDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Deletar conta do usuário logado' })
  @ApiResponse({ status: 200, description: 'Conta deletada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  remove(@UserToken() user: UserTokenDto) {
    return this.usersService.remove(user.sub);
  }
}
