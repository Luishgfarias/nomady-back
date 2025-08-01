import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostControllerDto {
  @ApiProperty({
    description: 'Título do post',
    example: 'Minha viagem para Paris',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Conteúdo do post (opcional)',
    example: 'Foi uma experiência incrível!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  content: string;
}
