import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ example: 1, description: '회원 id' })
  @IsInt()
  userId: number;
}
