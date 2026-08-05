import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreatePayItemDto {
  @ApiProperty({ example: 1, description: '상품 ID' })
  @IsInt()
  detail_color_id: number;

  @ApiProperty({ example: 2, description: '구매 수량' })
  @IsInt()
  quantity: number;
}
