import { ApiProperty } from '@nestjs/swagger';
import { PostResponseDto } from 'src/posts/dto/paginated-posts-response.dto';

export class PaginatedLikedPostsResponseDto {
  @ApiProperty({
    description: 'Lista de posts curtidos',
    type: [PostResponseDto],
  })
  posts: PostResponseDto[];

  @ApiProperty({
    description: 'Número total de posts curtidos',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 3,
  })
  totalPages: number;
}