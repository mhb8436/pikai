import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDetailProductDto {
  @ApiProperty({ example: '레드', description: '상품 컬러 이름' })
  @IsString()
  @MinLength(1)
  colorName: string;

  @ApiProperty({ example: 1, description: `컬러 이름을 검색할 상품 ID` })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;
}
