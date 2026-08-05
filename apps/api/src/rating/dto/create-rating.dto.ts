import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: 4, description: '별점' })
  @IsInt()
  @Min(1)
  @Max(5)
  star_rating: number;

  @ApiProperty({
    example: false,
    description: '관리자가 hsl 컬러를 추가해줘야하는 지 여부',
  })
  @IsBoolean()
  @IsOptional()
  is_hsl: boolean;

  @ApiProperty({ example: false, description: '비교 상품 여부' })
  @IsOptional()
  @IsBoolean()
  is_comp: boolean;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1, description: '제품 색상 번호' })
  detail_color_id: number;
}
