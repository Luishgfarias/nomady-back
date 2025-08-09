import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({
    description: 'ID único do post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Título do post',
    example: 'Minha viagem incrível',
  })
  title: string;

  @ApiProperty({
    description: 'Conteúdo do post',
    example: 'Hoje visitei um lugar maravilhoso...',
  })
  content: string;

  @ApiProperty({
    description: 'Status de publicação do post',
    example: true,
  })
  published: boolean;

  @ApiProperty({
    description: 'Data de criação do post',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'ID do autor do post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  authorId: string;

  @ApiProperty({
    description: 'Contadores relacionados ao post',
    type: 'object',
    properties: {
      likes: {
        type: 'number',
        description: 'Número de curtidas',
        example: 42,
      },
    },
  })
  _count: {
    likes: number;
  };

  @ApiProperty({
    description: 'Informações do autor',
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Nome do autor',
        example: 'João Silva',
      },
      profilePhoto: {
        type: 'string',
        description: 'URL da foto de perfil',
        example: 'https://example.com/photo.jpg',
        nullable: true,
      },
    },
  })
  author: {
    name: string;
    profilePhoto: string | null;
  };
}

export class PaginatedPostsResponseDto {
  @ApiProperty({
    description: 'Lista de posts',
    type: [PostResponseDto],
  })
  posts: PostResponseDto[];

  @ApiProperty({
    description: 'Número total de posts',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 15,
  })
  totalPages: number;
}