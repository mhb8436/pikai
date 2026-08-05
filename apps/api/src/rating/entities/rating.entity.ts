import { Rating } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RatingEntity implements Rating {
  @ApiProperty({ description: '별점의 고유한 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '별점 점수', example: 1 })
  star_rating: number;

  @ApiProperty({
    description: 'HSL 색상 관리자 추가 제품 여부',
    example: false,
    default: false,
  })
  is_hsl: boolean;

  @ApiProperty({
    description: '비교 제품 여부',
    example: false,
    default: false,
  })
  is_comp: boolean;

  @ApiProperty({ description: '별점을 작성한 사용자 id', example: 1 })
  user_id: number;

  @ApiProperty({ description: '별점에 해당되는 제품 컬러 id', example: 1 })
  detail_color_id: number;

  // Partial 은 RatingEntity가 가진 모든 필드가 아니라
  // 몇개 빼고 일부 필드만 넣어도 된다는 의미
  constructor(partial: Partial<RatingEntity>) {
    // partial 안에 있는 값 복사해 현재 생성되고 있는 엔티티에 넣어준다.
    Object.assign(this, partial);
  }
}
