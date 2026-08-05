import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateCartitemSelectDto {
  @ApiProperty({
    example: false,
    description: '상품 선택 여부',
  })
  @IsBoolean()
  is_selected: boolean;
}
