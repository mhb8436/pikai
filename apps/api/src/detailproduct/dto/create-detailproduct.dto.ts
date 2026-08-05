import { ApiProduces, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateDetailproductDto {
  @ApiProperty({ example: '색상 이름' })
  @IsString()
  color_name: string;

  @ApiProperty({ example: '색상 이미지' })
  @IsString()
  color_image: string;

  @ApiProperty({ example: '재고 수량' })
  @IsInt()
  stock: number;

  @ApiProperty({ example: 'H 값' })
  @IsInt()
  h: number;

  @ApiProperty({ example: 'S 값' })
  @IsInt()
  s: number;

  @ApiProperty({ example: 'L 값' })
  l: number;

  @ApiProperty({ example: 1, description: '제품 번호' })
  @IsInt()
  product_id: number;
}
