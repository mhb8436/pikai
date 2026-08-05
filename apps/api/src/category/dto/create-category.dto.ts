import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: '카테고리 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: '상품 목록' })
  @IsArray()
  @IsInt({ each: true })
  products: number[];
}
