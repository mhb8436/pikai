import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: '브랜드 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: '상품 목록' })
  @IsArray()
  @IsInt({ each: true })
  products: number[];
}
