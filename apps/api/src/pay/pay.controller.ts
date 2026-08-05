import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PayService } from './pay.service';
import { CreatePayDto } from './dto/create-pay.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';

@Controller('pay')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayController {
  constructor(private readonly payService: PayService) {}

  @Post()
  @ApiOperation({ summary: '결제' })
  create(
    @Body() createPayDto: CreatePayDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.payService.create(userId, createPayDto);
  }

  @Post('page')
  @ApiOperation({ summary: '결제 페이지 조회' })
  findOne(
    @Body()
    body: {
      isCartOrder: boolean;
      selectedOnly?: boolean;
      buyItems?: {
        detailColorId: number;
        quantity: number;
      }[];
    },
    @CurrentUser('id') userId: number,
  ) {
    return this.payService.findOne(
      userId,
      body.isCartOrder,
      body.selectedOnly,
      body.buyItems,
    );
  }
}
