import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryDto } from 'src/common/query.dto';
import { PersonalColor } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(query: QueryDto, userId: number) {
    const { page, limit } = query;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { user_id: userId },
        orderBy: { order_date: 'desc' },
        include: {
          orderItem: {
            orderBy: [
              { quantity: 'desc' },
              { price: 'desc' },
              { detail_color_id: 'asc' },
            ],
            include: {
              detailColor: {
                include: {
                  products: {
                    select: {
                      id: true,
                      name: true,
                      color_main_image: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where: { user_id: userId } }),
    ]);
    return { orders, total, page, limit, totalPage: Math.ceil(total / limit) };
  }

  getOrderItemNum(order_id: string) {
    return this.prisma.orderItem.count({ where: { order_id: order_id } });
  }

  async getOrderItem(orderId: string) {
    const existOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existOrder) {
      throw new NotFoundException(`[${orderId}] 주문이 없습니다.`);
    }

    return this.prisma.orderItem.findMany({
      where: { order_id: orderId },
    });
  }

  async findOne(id: string) {
    // 일단 있는 지 확인 추후 사용자 인증 개발 되면 해당 유저 인지 확인!
    const exist = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItem: {
          orderBy: [
            { quantity: 'desc' },
            { price: 'desc' },
            { detail_color_id: 'asc' },
          ],
          include: {
            detailColor: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true,
                    color_main_image: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!exist) {
      throw new NotFoundException(`[${id}] 해당하는 주문이 없어요`);
    }
    return exist;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userTone: PersonalColor,
  ) {
    // 존재 여부 확인
    const exist = await this.prisma.order.findUnique({ where: { id } });
    if (!exist) {
      throw new NotFoundException(`[${id}] 해당하는 주문이 없어요`);
    }
    return this.prisma.$transaction(async (tx) => {
      // 주문 상태 수정
      await tx.order.update({
        where: { id },
        data: updateOrderDto,
      });

      if (updateOrderDto.order_status === 'ConfirmPurchase') {
        const validTones = Object.values(PersonalColor);
        if (!validTones.includes(userTone)) {
          throw new BadRequestException(`유효하지 않은 톤입니다.`);
        }
        // 아이템 들 가져오기
        const orderItems = await tx.orderItem.findMany({
          where: { order_id: id },
        });

        if (!orderItems) {
          throw new NotFoundException('상품들이 없어요');
        }

        for (const order of orderItems) {
          await tx.sale.upsert({
            where: {
              detail_color_id: order.detail_color_id,
            },
            update: {
              sale_count: { increment: order.quantity },
              [userTone]: { increment: order.quantity },
            },
            create: {
              detail_color_id: order.detail_color_id,
              sale_count: order.quantity,
              [userTone]: order.quantity,
            },
          });
        }
      }
    });
  }
}
