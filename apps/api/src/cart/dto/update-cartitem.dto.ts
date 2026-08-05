import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartitemDto {
  @ApiProperty({
    example: 3,
    description: '변경할 상품 수량',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
