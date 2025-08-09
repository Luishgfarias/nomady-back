import { ApiProperty } from '@nestjs/swagger';

export class DeletePostResponseDto {
  @ApiProperty({
    description: 'Mensagem de confirmação da deleção',
    example: 'Post with ID 123e4567-e89b-12d3-a456-426614174000 deleted successfully',
  })
  message: string;
}