import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryDto } from 'src/common/query.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PersonalColor } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';

@Controller('order')
@ApiTags('Order')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '사용자 별 주문 목록 조회(최신순)' })
  findAll(@Query() query: QueryDto, @CurrentUser('id') userId: number) {
    return this.orderService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '주문 번호로 조회' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @ApiOperation({ summary: '배송 상태 변경' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser('tone') userTone: PersonalColor,
  ) {
    return this.orderService.update(id, updateOrderDto, userTone);
  }
}
