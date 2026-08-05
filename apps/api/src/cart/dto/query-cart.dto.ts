import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryCartDto {
  @ApiProperty({
    example: false,
    description: '장바구니 주문 여부',
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isCartOrder: boolean;

  @ApiProperty({
    example: false,
    description: '선택된 상품만 조회할지 여부',
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  selectedOnly: boolean;
}
