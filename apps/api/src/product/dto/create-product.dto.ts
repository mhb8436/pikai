import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: '상품 메인 사진 파일명' })
  @IsString()
  color_main_image: string;

  @ApiProperty({ example: '상품 상세 사진 파일명' })
  @IsString()
  color_detail_image: string;

  @ApiProperty({ example: '상품 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: '해시태그' })
  @IsArray()
  @IsString({ each: true })
  hash_tag: string[];

  @ApiProperty({ example: '정가: 10000', description: '원단위' })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ example: '판매 여부' })
  @IsBoolean()
  is_sale: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  category_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  brand_id: number;
}
