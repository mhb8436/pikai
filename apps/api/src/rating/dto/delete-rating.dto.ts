import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteRatingDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: '삭제할 별점의 id들',
  })
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      return value.split(',').map(Number);
    }
    return [Number(value)];
  })
  @IsNumber({}, { each: true })
  ids: number[];
}
