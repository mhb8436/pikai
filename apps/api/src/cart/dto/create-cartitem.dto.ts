import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCartitemDto {
  @ApiProperty({
    example: 1,
    description: '장바구니 ID',
  })
  @IsInt()
  cart_id: number;

  @ApiProperty({
    example: 3,
    description: '상품 색상(DetailProduct) ID',
  })
  @IsInt()
  detail_color_id: number;

  @ApiProperty({
    example: 2,
    description: '수량',
    default: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
  // 바로구매 상품인지 구분합니다.
  // true이면 바로구매용, false이면 일반 장바구니용입니다.
  @ApiProperty({
    example: false,
    description: '바로구매 상품 여부',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_now?: boolean;
  // 가격은 DB에서 조회하므로 DTO에서는 받지 않습니다.
  // @ApiProperty({
  //   example: 15000,
  //   description: '장바구니 담을 당시 상품 가격',
  // })
  // @IsInt()
  // @Min(0)
  // price: number;
}
