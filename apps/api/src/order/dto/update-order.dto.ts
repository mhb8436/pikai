import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @ApiProperty({ example: OrderStatus.PAYCOMPLETED })
  order_status: OrderStatus;
}
