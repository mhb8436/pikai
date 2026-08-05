import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export enum ProductSort {
  SALES = 'sales',
  LATEST = 'latest',
  PRICE_ASC = 'priceAsc',
  PRICE_DESC = 'priceDesc',
}

export class QueryProductDto {
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ description: '페이지 번호', required: false, example: 1 })
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: '한페이지에 가져올 상품 수',
    required: false,
    example: 10,
  })
  @Transform(({ value }) => Number(value))
  limit: number = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ description: '카테고리 ID', required: false, example: 1 })
  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : Number(value),
  )
  categoryId?: number;

  @ApiProperty({
    description: '상품 정렬 방식',
    enum: ProductSort,
    example: ProductSort.LATEST,
    default: ProductSort.LATEST,
  })
  @IsOptional()
  @IsEnum(ProductSort)
  sort: ProductSort = ProductSort.LATEST;

  @IsOptional()
  @ApiProperty({
    example: '헤라',
    description: '브랜드 상품 이름',
    required: false,
  })
  @IsString()
  @MinLength(1)
  productName: string;
}
