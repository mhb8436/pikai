import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePayItemDto } from './create-pay-item.dto';
import { Type } from 'class-transformer';

export class CreatePayDto {
  //결제
  @ApiProperty({ example: '계좌이체' })
  @IsString()
  payment: string;

  //배송 정보
  @ApiProperty({ example: '서울시 금천구', description: '배송지 정보' })
  @IsString()
  @IsNotEmpty()
  delivery_info: string;

  @ApiProperty({ example: '11111', description: '배송 우편 번호' })
  @IsString()
  postal_code: string;

  @ApiProperty({ example: '문 앞에 놔주세요.', description: '배송 요청 사항' })
  @IsString()
  delivery_inst: string;

  @ApiProperty({ example: '010-1234-5678', description: '휴대폰 번호' })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: '수령인', description: '받는 사람' })
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ example: 'true' })
  @IsBoolean()
  isCartOrder: boolean;

  @ApiProperty()
  @IsBoolean()
  selectedOnly: boolean;

  //주문 상품
  @ApiProperty({ type: [CreatePayItemDto], description: '주문 상품 목록' })
  @ValidateNested({ each: true })
  @Type(() => CreatePayItemDto)
  items: CreatePayItemDto[];
}
